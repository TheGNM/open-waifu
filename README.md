# Yume — Project Roadmap

**Stack:** Arch Linux (Nyarch) · i7-4790k · RX 6600 XT (8GB) · 16GB DDR3
**Core:** Ollama (`llama3.2:3b`) · ChromaDB · FastAPI · Custom web UI

---

## ✅ Completed

### Personality
- Custom Modelfile with sweet/caring, casual-slang base personality
- Few-shot `MESSAGE` examples added to reduce generic/repetitive responses
- Tuned parameters (temperature, top_p, repeat_penalty) for stability + variety
- Signature catchphrase ("I gotchu")
- Quirky habit (trailing off mid-thought: "...wait" / "actually—")
- Time awareness (references current date/time naturally)
- Light yandere trait blended in (playful possessiveness, clearly comedic, never controlling/isolating)

### Memory
- ChromaDB persistent vector database (`yume_memory_db`)
- `nomic-embed-text` embeddings via Ollama
- Semantic recall of relevant past exchanges (not just recency-based)
- Manual memory add/delete via API
- Memory transparency panel (view what's stored)
- Backup/restore memory DB (zip export/import)

### Backend / Infrastructure
- `yume_core.py` — reusable core logic (personality + memory, no UI coupling)
- `server.py` — FastAPI backend exposing `/chat`, `/regenerate`, `/reset`, `/export`, `/memories`, `/backup`, `/restore`, `/streak`, `/health`
- Streaming responses (word-by-word, not full-block)
- Conversation history persists per server session (resets on restart — by design, long-term memory is separate)
- Idle-triggered system messages excluded from memory/history pollution

### Web UI
- Clean localhost-served chat interface (not a static file — served via FastAPI)
- Separated `index.html` / `style.css` / `app.js`
- Streaming text with typing indicator
- Markdown rendering support
- Timestamps on messages
- Dark/light theme toggle
- Settings panel: temperature slider, response length (short/normal/long), idle check-in toggle + delay, mood indicator toggle
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
- Successfully ran GPU-accelerated via PyTorch + ROCm (`HSA_OVERRIDE_GFX_VERSION=10.3.0`) on RX 6600 XT — confirmed working despite unofficial hardware support
- ONNX Runtime route confirmed **not viable** on this GPU (no ROCm/MIGraphX support for consumer RDNA2)
- Wiped during cleanup; not yet reintegrated into the FastAPI + memory stack

### VTube Avatar (attempted, scrapped)
- Sourced free official Live2D sample model (Hiyori, from live2d.com)
- Scaffolded Tauri-based transparent overlay app
- Set up pixi-live2d-display rendering pipeline + click-through toggle groundwork
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
- Edit your own sent message (fix typos without full regenerate)
- Pin important messages (optionally feed into memory with higher priority)
- Search past conversation (in visible chat history)
- Multiple personality presets (quick-switch dropdown between saved Modelfile variants — e.g. sweet vs. tsundere vs. yandere-heavy)

### Memory
- Auto-filter what's worth saving (skip small talk, only store meaningful facts/preferences)
- Memory "importance" scoring/tagging (manual or automatic)
- Memory categories/tags (e.g. "preferences," "events," "people mentioned")

### Voice / Audio
- Rebuild Kokoro TTS integration into the main stack (stream audio per reply)
- Emotion-influenced voice tone (if/when a TTS engine supports it)
- Voice input via browser Speech Recognition API (talk instead of type)
- Notification sound on new reply

### VTube / Visual
- Rebuild the Tauri transparent overlay
- Emotion-to-expression mapping (lightweight, not strict LLM-output tags — could infer from text sentiment instead)
- Lip sync driven by TTS audio output
- Idle desktop animations (blinking, swaying) independent of chat activity
- Custom avatar image in the web chat UI (before/alongside full VTube integration)
- User-uploadable chat background image

### Companion / Fun
- "What Yume is thinking" idle thought bubbles (desktop overlay, non-chat flavor text)
- Simple mini-games or icebreaker variety packs (different themes: deep talks, silly questions, etc.)
- Relationship/mood trend over time (visualized, not just per-message)
- Special date awareness (remembers user's birthday, anniversaries of first chat, etc.)
- Yandere trait intensity slider (toggle her possessiveness level live from settings, rather than requiring a Modelfile rebuild)

### Infrastructure
- Multiple saved conversation "threads" (separate from single continuous session)
- Config file for easy personality/parameter switching without manual Modelfile edits
- Simple setup/install script (bundle the recurring `uv add` / `ollama pull` / `ollama create` steps)
- Push notifications for unprompted messages even when the tab/app isn't open

---

## Notes / Lessons Learned
- `llama3.2:1b` had a GPU-offload issue on this system (ran on CPU, ~11 tok/s) — `llama3.2:3b` runs properly on GPU (~83 tok/s) and is the better choice despite being "bigger."
- ONNX Runtime's ROCm backend only officially supports AMD Instinct (data-center) GPUs — not consumer Radeon cards. PyTorch's ROCm build has broader (unofficial but working) RDNA2 support via `HSA_OVERRIDE_GFX_VERSION`.
- Aggressive repetition-penalty tuning (`frequency_penalty`/`presence_penalty` stacked with high `repeat_penalty`) caused output instability/garbling on the 3B model — safer to keep penalty parameters moderate.
- Corrupted or hallucinated "memories" can poison future responses — periodic review via the memory transparency panel is worthwhile.
