from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from yume_core import get_yume_response_stream
from memory import get_memory_count, get_all_memories, delete_memory, add_manual_memory
import ollama
import shutil
import os
import json
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

conversation_history = []

class ChatRequest(BaseModel):
    message: str
    temperature: float = 0.8
    response_length: str = "normal"

class MemoryRequest(BaseModel):
    text: str

@app.get("/")
def serve_home():
    return FileResponse("index.html")

@app.post("/chat")
def chat(request: ChatRequest):
    is_idle_trigger = request.message.startswith("[System:")

    def event_stream():
        for piece in get_yume_response_stream(
            request.message,
            conversation_history,
            request.temperature,
            response_length=request.response_length,
            skip_save=is_idle_trigger
        ):
            yield piece
    return StreamingResponse(event_stream(), media_type="text/plain")

@app.post("/regenerate")
def regenerate(request: ChatRequest):
    if conversation_history and conversation_history[-1]["role"] == "assistant":
        conversation_history.pop()
    last_user_msg = conversation_history.pop()["content"] if conversation_history else request.message

    def event_stream():
        for piece in get_yume_response_stream(
            last_user_msg,
            conversation_history,
            request.temperature,
            response_length=request.response_length
        ):
            yield piece
    return StreamingResponse(event_stream(), media_type="text/plain")

@app.post("/reset")
def reset():
    conversation_history.clear()
    return {"status": "conversation reset"}

@app.get("/export")
def export_chat():
    lines = [f"{'You' if m['role']=='user' else 'Yume'}: {m['content']}" for m in conversation_history]
    return PlainTextResponse(
        "\n\n".join(lines),
        headers={"Content-Disposition": "attachment; filename=yume_chat_export.txt"}
    )

# ---- Health check ----
@app.get("/health")
def health():
    try:
        ollama.list()
        ollama_ok = True
    except Exception:
        ollama_ok = False
    try:
        get_memory_count()
        db_ok = True
    except Exception:
        db_ok = False
    return {"ollama": ollama_ok, "memory_db": db_ok}

# ---- Memory transparency ----
@app.get("/memories")
def list_memories():
    mems = get_all_memories()
    return {"count": get_memory_count(), "memories": [{"id": mid, "text": text} for mid, text in mems]}

@app.post("/memories/add")
def add_memory(request: MemoryRequest):
    mem_id = add_manual_memory(request.text)
    return {"id": mem_id, "status": "added"}

@app.delete("/memories/{memory_id}")
def remove_memory(memory_id: str):
    delete_memory(memory_id)
    return {"status": "deleted"}

# ---- Backup / restore ----
@app.get("/backup")
def backup_db():
    shutil.make_archive("yume_memory_backup", "zip", "yume_memory_db")
    return FileResponse("yume_memory_backup.zip", filename="yume_memory_backup.zip")

@app.post("/restore")
async def restore_db(file: UploadFile = File(...)):
    temp_path = "restore_upload.zip"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    shutil.rmtree("yume_memory_db", ignore_errors=True)
    shutil.unpack_archive(temp_path, "yume_memory_db", "zip")
    os.remove(temp_path)
    return {"status": "restored"}

# ---- Streak tracking ----
@app.get("/streak")
def get_streak():
    streak_file = "streak.json"
    today = datetime.now().date().isoformat()
    if os.path.exists(streak_file):
        with open(streak_file) as f:
            data = json.load(f)
    else:
        data = {"last_date": None, "streak": 0}

    if data["last_date"] != today:
        yesterday = (datetime.now().date() - timedelta(days=1)).isoformat()
        if data["last_date"] == yesterday:
            data["streak"] += 1
        else:
            data["streak"] = 1
        data["last_date"] = today
        with open(streak_file, "w") as f:
            json.dump(data, f)

    return {"streak": data["streak"]}
