import ollama
import uuid
from datetime import datetime
from memory import save_memory, recall_memories

def get_yume_response_stream(user_input, conversation_history=None, temperature=0.8, skip_save=False, response_length="normal"):
    if conversation_history is None:
        conversation_history = []

    recalled = recall_memories(user_input)
    memory_context = ""
    if recalled:
        memory_context = "Relevant things you remember about the user:\n" + "\n".join(f"- {doc}" for _, doc in recalled)

    now = datetime.now()
    time_context = f"Current date and time: {now.strftime('%A, %B %d, %Y — %I:%M %p')}"

    length_instruction = {
        "short": "Keep your reply very brief, one sentence max.",
        "normal": "",
        "long": "Feel free to elaborate a bit more than usual in your reply."
    }.get(response_length, "")

    system_parts = [time_context]
    if memory_context:
        system_parts.append(memory_context)
    if length_instruction:
        system_parts.append(length_instruction)

    convo = conversation_history.copy()
    convo = [{"role": "system", "content": "\n\n".join(system_parts)}] + convo
    convo.append({"role": "user", "content": user_input})

    full_reply = ""
    stream = ollama.chat(model="yume", messages=convo, stream=True, options={"temperature": temperature})
    for chunk in stream:
        piece = chunk["message"]["content"]
        full_reply += piece
        yield piece

    if not skip_save:
        save_memory(f"User said: {user_input} | Yume replied: {full_reply}", str(uuid.uuid4()))
        conversation_history.append({"role": "user", "content": user_input})
        conversation_history.append({"role": "assistant", "content": full_reply})
