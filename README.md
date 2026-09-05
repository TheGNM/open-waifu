# Yume — AI Companion

A locally-run AI companion with persistent memory, a custom personality, and a web chat interface. Built on Ollama, ChromaDB, and FastAPI.

**Stack used in development:** Arch Linux (Nyarch) · i7-4790k · RX 6600 XT (8GB) · 16GB DDR3
**Core:** Ollama (`llama3.2:3b`) · ChromaDB · FastAPI · Custom web UI

---

## Features

- 🧠 **Personality** — custom character defined via an Ollama Modelfile (casual, warm, with quirks/catchphrases)
- 💾 **Long-term memory** — ChromaDB vector database recalls relevant past conversations, not just recent messages
- 🌐 **Web chat UI** — streaming responses, markdown rendering, dark/light theme
- ⚙️ **Settings panel** — live temperature control, response length, idle check-ins, mood indicator toggle
- 📊 **Memory transparency** — view, add, delete, backup, and restore what Yume remembers
- 🔥 **Streak counter, icebreakers, health check indicator**

---

## Installation (Arch Linux / general Linux)

### 1. Install Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh
```
Or on Arch specifically:
```bash
sudo pacman -S ollama
```
Start the Ollama service:
```bash
sudo systemctl enable --now ollama
```

### 2. Pull the required models
```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

### 3. Install `uv` (Python package/environment manager)
```bash
sudo pacman -S uv
```
If unavailable via pacman, use `pipx` instead:
```bash
sudo pacman -S python-pipx
pipx install uv
```

### 4. Clone this repo
```bash
git clone https://github.com/TheGNM/open-waifu
cd open-waifu
```

### 5. Set up the Python environment
```bash
uv init -p 3.12
uv add ollama chromadb fastapi uvicorn python-multipart
```

### 6. Build Yume's personality model
Make sure `Modelfile` is present in the project root (included in this repo), then:
```bash
ollama create yume -f Modelfile
```

### 7. Run the server
```bash
uv run uvicorn server:app --reload --port 8000
```

### 8. Open the web UI
Visit **http://localhost:8000** in your browser.

---

## Project Structure

```
yume/
├── Modelfile           # Defines Yume's personality/parameters
├── server.py            # FastAPI backend (chat, memory, health, backup/restore)
├── yume_core.py          # Core logic: LLM calls + memory retrieval
├── memory.py             # ChromaDB wrapper (save/recall/delete memories)
├── index.html            # Web chat UI
└── static/
    ├── style.css
    └── app.js
```

---

## Customizing Yume's Personality

Edit the `SYSTEM` block inside `Modelfile`, then rebuild:
```bash
nano Modelfile
ollama create yume -f Modelfile
```
Restart the server afterward to pick up the change (the model itself updates immediately; the running server just needs a restart if you changed anything in the Python files too).

---

## Resetting Memory

To wipe Yume's long-term memory completely:
```bash
rm -rf yume_memory_db
```
A fresh, empty database is created automatically the next time the server runs.

To back up or restore memory instead of wiping it, use the **Memory panel** in the web UI (backup/restore buttons).

---

## ✅ Completed

### Personality
- Custom Modelfile with sweet/caring, casual-slang base personality
- Few-shot `MESSAGE` examples to reduce generic/repetitive responses
- Tuned parameters (temperature, top_p, repeat_penalty) for stability + variety
- Signature catchphrase ("I gotchu")
- Quirky habit (trailing off mid-thought: "...wait" / "actually—")
- Time awareness (references current date/time naturally)
- Light yandere trait blended in (playful possessiveness, clearly comedic, never controlling/isolating)

### Memory
- ChromaDB persistent vector database
- `nomic-embed-text` embeddings via Ollama
- Semantic recall of relevant past exchanges (not just recency-based)
- Manual memory add/delete via API
- Memory transparency panel (view what's stored)
- Backup/restore memory DB (zip export/import)

### Backend / Infrastructure
- `yume_core.py` — reusable core logic (personality + memory, no UI coupling)
- `server.py` — FastAPI backend exposing `/chat`, `/regenerate`, `/reset`, `/export`, `/memories`, `/backup`, `/restore`, `/streak`, `/health`
- Streaming responses (word-by-word)
- Idle-triggered system messages excluded from memory/history pollution

### Web UI
- Clean localhost-served chat interface
- Separated `index.html` / `style.css` / `app.js`
- Streaming text with typing indicator
- Markdown rendering support
- Timestamps on messages
- Dark/light theme toggle
- Settings panel: temperature slider, response length, idle check-in toggle + delay, mood indicator toggle
- Mood indicator (keyword-based heuristic, color-coded dot)
- Regenerate last reply
- Export conversation to `.txt`
- Reset conversation (keeps long-term memory)
- Health check indicator (Ollama + ChromaDB status)
- Daily streak counter
- Icebreaker button (random conversation starters)
- Idle check-ins (unprompted message after inactivity)
- Time-aware greeting on load/reset

### Voice (built once, currently removed)
- Kokoro-82M TTS
- Successfully ran GPU-accelerated via PyTorch + ROCm (`HSA_OVERRIDE_GFX_VERSION=10.3.0`) on RX 6600 XT
- ONNX Runtime route confirmed **not viable** on this GPU (no ROCm/MIGraphX support for consumer RDNA2)
- Not yet reintegrated into the FastAPI + memory stack

### VTube Avatar (attempted, scrapped)
- Sourced free official Live2D sample model (Hiyori, from live2d.com)
- Scaffolded Tauri-based transparent overlay app with pixi-live2d-display
- Deleted before completion — revisit later if desired

---

## ⏳ Not Yet Started
- Discord bot (reuse `yume_core.py`, wrap in Discord event handlers)
- Reintegrating voice into the main FastAPI/web stack (auto-play TTS per reply)
- VTube avatar rebuild + wiring to backend (emotion-driven expressions, lip sync from voice)

---

## 💡 Optional Ideas — Not Yet Built

### Conversation quality
- Message reactions (👍❤️😂) as lightweight feedback signal
- Edit your own sent message
- Pin important messages
- Search past conversation
- Multiple personality presets (quick-switch between saved Modelfile variants)

### Memory
- Auto-filter what's worth saving (skip small talk)
- Memory "importance" scoring/tagging
- Memory categories/tags

### Voice / Audio
- Rebuild Kokoro TTS integration into the main stack
- Emotion-influenced voice tone
- Voice input via browser Speech Recognition API
- Notification sound on new reply

### VTube / Visual
- Rebuild the Tauri transparent overlay
- Emotion-to-expression mapping
- Lip sync driven by TTS audio output
- Idle desktop animations independent of chat activity
- Custom avatar image in the web chat UI
- User-uploadable chat background image

### Companion / Fun
- "What Yume is thinking" idle thought bubbles
- Mini-games or icebreaker variety packs
- Relationship/mood trend over time
- Special date awareness (birthdays, chat anniversaries)
- Yandere trait intensity slider (live toggle, no rebuild needed)

### Infrastructure
- Multiple saved conversation "threads"
- Config file for personality/parameter switching without manual edits
- Simple setup/install script
- Push notifications for unprompted messages

---

## Notes / Lessons Learned
- `llama3.2:1b` had a GPU-offload issue on this system (ran on CPU, ~11 tok/s) — `llama3.2:3b` runs properly on GPU (~83 tok/s) and is the better choice despite being "bigger."
- ONNX Runtime's ROCm backend only officially supports AMD Instinct (data-center) GPUs, not consumer Radeon cards. PyTorch's ROCm build has broader (unofficial but working) RDNA2 support via `HSA_OVERRIDE_GFX_VERSION`.
- Aggressive repetition-penalty tuning (stacking `frequency_penalty`/`presence_penalty` with a high `repeat_penalty`) caused output instability/garbling on the 3B model — keep penalty parameters moderate.
- Corrupted or hallucinated "memories" can poison future responses — periodic review via the memory transparency panel is worthwhile.

---

## Credits / Third-Party Materials

| Name | Purpose | License |
|---|---|---|
| [Ollama](https://ollama.com) | Local LLM runtime | MIT |
| [llama3.2:3b](https://ollama.com/library/llama3.2) | Language model | Llama 3.2 Community License |
| [nomic-embed-text](https://ollama.com/library/nomic-embed-text) | Text embeddings | Apache 2.0 |
| [ChromaDB](https://www.trychroma.com) | Vector database | Apache 2.0 |
| [FastAPI](https://fastapi.tiangolo.com) | Backend framework | MIT |
| [marked.js](https://marked.js.org) | Markdown rendering | MIT |
| [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) | Text-to-speech (planned reintegration) | Apache 2.0 |
| [Hiyori Momose (Live2D)](https://www.live2d.com/en/) | VTube avatar model (planned reintegration) | Live2D Free Material License — review before public/commercial use |

---

## License

This project's own code is licensed under the **MIT License**. Third-party models and assets listed above retain their own separate licenses — check each before public release or commercial use.
