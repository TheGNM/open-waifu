# Yume — Third-Party Tools & Open-Source Materials

A running list of every external tool, model, library, and asset used while building Yume. Check each item's actual license/terms before any public release or commercial use — this list is for reference, not legal confirmation.

---

## AI Models

| Name | Purpose | Source | License / Notes |
|---|---|---|---|
| **llama3.2:1b** | LLM (initial test, later dropped) | [Ollama library](https://ollama.com/library/llama3.2) | Llama 3.2 Community License |
| **llama3.2:3b** | LLM powering Yume's personality | [Ollama library](https://ollama.com/library/llama3.2) | Llama 3.2 Community License |
| **nomic-embed-text** | Text embeddings for memory recall | [Ollama library](https://ollama.com/library/nomic-embed-text) | Apache 2.0 |
| **Kokoro-82M** | Text-to-speech (built once, later removed) | [Hugging Face: hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) | Apache 2.0 |
| **Hiyori Momose** (Live2D model) | VTube avatar (scaffolded, later deleted) | [live2d.com sample data](https://www.live2d.com/en/) | Live2D Free Material License Agreement — check terms before any commercial/public use |

---

## Runtimes & Core Platforms

| Name | Purpose | Source |
|---|---|---|
| **Ollama** | Local LLM runtime/server | [ollama.com](https://ollama.com) |
| **Open WebUI** | Browser-based chat UI (installed early on, not used in final build) | [openwebui.com](https://openwebui.com) |
| **ROCm / HIP / MIOpen** | AMD GPU compute stack (enabled GPU acceleration for Kokoro via PyTorch) | [rocm.docs.amd.com](https://rocm.docs.amd.com) |
| **Rust** | Required for Tauri | [rust-lang.org](https://www.rust-lang.org) |
| **Node.js / npm** | JavaScript tooling for Tauri frontend | [nodejs.org](https://nodejs.org) |
| **Tauri** | Desktop app framework for the (scrapped) transparent VTube overlay | [tauri.app](https://tauri.app) |

---

## Python Libraries

| Package | Purpose |
|---|---|
| **ollama** (Python client) | Talking to the local Ollama server from Python |
| **chromadb** | Vector database for long-term memory |
| **fastapi** | Backend API server |
| **uvicorn** | ASGI server running FastAPI |
| **python-multipart** | Required by FastAPI for file uploads (memory backup/restore) |
| **torch** (PyTorch, ROCm build) | Ran Kokoro TTS with GPU acceleration |
| **kokoro** | PyTorch-based Kokoro TTS package |
| **kokoro-onnx** | ONNX-based Kokoro TTS package (tested, ultimately dropped in favor of PyTorch route) |
| **onnxruntime** / **onnxruntime-rocm** | ONNX inference backend (tested for Kokoro GPU accel — ROCm variant didn't support this consumer GPU) |
| **soundfile** | Writing generated audio to `.wav` |
| **sounddevice** | Playing generated audio directly |
| **spacy** (`en_core_web_sm`) | Auto-installed dependency of Kokoro for text tokenization |

---

## JavaScript Libraries

| Package | Purpose |
|---|---|
| **marked.js** | Markdown rendering in the web chat UI (loaded via CDN) |
| **pixi.js** | 2D rendering engine, used as the base for Live2D display |
| **pixi-live2d-display** | Live2D model rendering on top of PixiJS (Tauri avatar app) |

---

## Tooling / Package Managers

| Tool | Purpose |
|---|---|
| **uv** | Fast Python package/environment manager used for all Python projects |
| **pipx** | Installed `uv` itself in an isolated environment |
| **pacman** | Arch Linux system package manager |

---

## Notes
- **OpenClaw** was mentioned early on as an installed tool but was never used or explained further in this project — not included above pending clarification.
- Voice (Kokoro) and VTube avatar (Tauri + Hiyori) were both built successfully at least once but later removed/deleted during cleanup; they're listed here since the tools/models were genuinely used and may be reintroduced later.
- Always double check individual licenses (especially the Live2D sample data terms and the Llama Community License) before any public distribution, monetization, or commercial use of the finished project.
