const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const moodDot = document.getElementById("moodDot");
const regenBtn = document.getElementById("regenBtn");

let lastUserMessage = "";
let idleTimer = null;

// ---- Settings persistence ----
function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("yume_settings") || "{}");
  if (saved.theme) { document.getElementById("themeSelect").value = saved.theme; setTheme(saved.theme, false); }
  if (saved.temperature) { document.getElementById("tempSlider").value = saved.temperature; document.getElementById("tempVal").textContent = saved.temperature; }
  if (saved.moodEnabled !== undefined) document.getElementById("moodToggle").checked = saved.moodEnabled;
  if (saved.idleEnabled !== undefined) document.getElementById("idleToggle").checked = saved.idleEnabled;
  if (saved.idleMinutes) { document.getElementById("idleSlider").value = saved.idleMinutes; document.getElementById("idleVal").textContent = saved.idleMinutes; }
  if (saved.responseLength) document.getElementById("lengthSelect").value = saved.responseLength;
}
function saveSettings() {
  const settings = {
    theme: document.getElementById("themeSelect").value,
    temperature: document.getElementById("tempSlider").value,
    moodEnabled: document.getElementById("moodToggle").checked,
    idleEnabled: document.getElementById("idleToggle").checked,
    idleMinutes: document.getElementById("idleSlider").value,
    responseLength: document.getElementById("lengthSelect").value,
  };
  localStorage.setItem("yume_settings", JSON.stringify(settings));
}

function setTheme(value, save = true) {
  document.body.className = value;
  if (save) saveSettings();
}

// ---- Chat history persistence ----
function saveHistory() {
  localStorage.setItem("yume_chat_html", chatbox.innerHTML);
}
function loadHistory() {
  const saved = localStorage.getItem("yume_chat_html");
  if (saved) chatbox.innerHTML = saved;
}
function clearLocalChat() {
  if (!confirm("Clear saved chat display in this browser? (Server memory is untouched)")) return;
  localStorage.removeItem("yume_chat_html");
  chatbox.innerHTML = "";
}

// ---- Time-aware greeting ----
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "up late, huh?";
  if (hour < 12) return "good morning!";
  if (hour < 18) return "good afternoon!";
  return "good evening!";
}
function showInitialGreeting() {
  if (chatbox.innerHTML.trim() === "") {
    const greeting = document.createElement("div");
    greeting.className = "msg yume";
    greeting.textContent = `Hey! ${getTimeGreeting()} What's up?`;
    chatbox.appendChild(greeting);
  }
}

// ---- Message rendering ----
function addMessage(text, sender, save = true) {
  const wrapper = document.createElement("div");
  wrapper.className = "msg " + sender;
  wrapper.innerHTML = marked.parse(text);
  const time = document.createElement("div");
  time.className = "timestamp";
  time.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  wrapper.appendChild(time);
  chatbox.appendChild(wrapper);
  chatbox.scrollTop = chatbox.scrollHeight;
  if (save) saveHistory();
  return wrapper;
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "typing";
  div.id = "typingIndicator";
  div.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}
function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

// ---- Mood detection ----
function updateMood(text) {
  if (!document.getElementById("moodToggle").checked) {
    moodDot.style.background = "#888";
    return;
  }
  const t = text.toLowerCase();
  if (/(sad|sorry|rough|stress|worried|tired)/.test(t)) moodDot.style.background = "#f7b84a";
  else if (/(!|yay|awesome|excited|lol|haha)/.test(t)) moodDot.style.background = "#4af78a";
  else if (/(hmm|actually|wait)/.test(t)) moodDot.style.background = "#7a9cf7";
  else moodDot.style.background = "#888";
}

// ---- Core send logic ----
async function streamReply(endpoint, message) {
  sendBtn.disabled = true;
  showTyping();

  const temp = parseFloat(document.getElementById("tempSlider").value);
  const length = document.getElementById("lengthSelect").value;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: message, temperature: temp, response_length: length })
  });

  removeTyping();
  const yumeDiv = addMessage("", "yume", false);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
    yumeDiv.innerHTML = marked.parse(fullText) + `<div class="timestamp">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  saveHistory();
  updateMood(fullText);
  regenBtn.style.display = "inline-block";
  sendBtn.disabled = false;
  userInput.focus();
  resetIdleTimer();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  lastUserMessage = text;
  addMessage(text, "user");
  userInput.value = "";
  await streamReply("/chat", text);
}

async function regenerate() {
  if (!lastUserMessage) return;
  const msgs = chatbox.querySelectorAll(".msg.yume");
  if (msgs.length) msgs[msgs.length - 1].remove();
  saveHistory();
  await streamReply("/regenerate", lastUserMessage);
}

// ---- Reset ----
async function resetChat() {
  if (!confirm("Reset the current conversation? (Long-term memory is kept)")) return;
  await fetch("/reset", { method: "POST" });
  chatbox.innerHTML = "";
  localStorage.removeItem("yume_chat_html");
  regenBtn.style.display = "none";
  showInitialGreeting();
  saveHistory();
}

// ---- Export ----
function exportChat() {
  window.location.href = "/export";
}

// ---- Settings panel toggle ----
function toggleSettings() {
  const panel = document.getElementById("settingsPanel");
  panel.style.display = (panel.style.display === "none" || !panel.style.display) ? "block" : "none";
}

// ---- Idle "unprompted message" ----
function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (!document.getElementById("idleToggle").checked) return;
  const minutes = parseFloat(document.getElementById("idleSlider").value);
  idleTimer = setTimeout(() => {
    streamReply("/chat", "[System: it's been quiet for a bit, check in on the user casually]");
  }, minutes * 60000);
}

// ---- Streak ----
async function loadStreak() {
  try {
    const res = await fetch("/streak");
    const data = await res.json();
    document.getElementById("streakDisplay").textContent = `🔥 ${data.streak} day streak`;
  } catch {
    document.getElementById("streakDisplay").textContent = `🔥 -- day streak`;
  }
}

// ---- Health check ----
async function checkHealth() {
  const dot = document.getElementById("healthDot");
  try {
    const res = await fetch("/health");
    const data = await res.json();
    dot.style.background = (data.ollama && data.memory_db) ? "#4af78a" : "#f7b84a";
    dot.title = `Ollama: ${data.ollama ? "OK" : "DOWN"} | Memory DB: ${data.memory_db ? "OK" : "DOWN"}`;
  } catch {
    dot.style.background = "#f74a4a";
    dot.title = "Server unreachable";
  }
}

// ---- Icebreakers ----
const icebreakers = [
  "What's something small that made you smile today?",
  "If you could instantly master any skill, what would it be?",
  "What's a show or game you've been meaning to start?",
  "What's your comfort food when you're having a rough day?",
  "Any weekend plans, or just winging it?",
  "What's something you're looking forward to?",
];
function sendIcebreaker() {
  const pick = icebreakers[Math.floor(Math.random() * icebreakers.length)];
  userInput.value = pick;
  userInput.focus();
}

// ---- Memory panel ----
async function loadMemoryPanel() {
  const res = await fetch("/memories");
  const data = await res.json();
  document.getElementById("memCount").textContent = data.count;
  const list = document.getElementById("memList");
  list.innerHTML = "";
  data.memories.slice().reverse().forEach(m => {
    const row = document.createElement("div");
    row.className = "memRow";
    const span = document.createElement("span");
    span.textContent = m.text;
    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.onclick = () => deleteMemory(m.id);
    row.appendChild(span);
    row.appendChild(btn);
    list.appendChild(row);
  });
}
async function deleteMemory(id) {
  await fetch(`/memories/${id}`, { method: "DELETE" });
  loadMemoryPanel();
}
async function addManualMemory() {
  const text = document.getElementById("manualMemInput").value.trim();
  if (!text) return;
  await fetch("/memories/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  document.getElementById("manualMemInput").value = "";
  loadMemoryPanel();
}
function toggleMemoryPanel() {
  const panel = document.getElementById("memoryPanel");
  const show = panel.style.display === "none" || !panel.style.display;
  panel.style.display = show ? "block" : "none";
  if (show) loadMemoryPanel();
}

// ---- Backup/restore ----
function backupDB() { window.location.href = "/backup"; }
async function restoreDB(input) {
  if (!input.files.length) return;
  if (!confirm("This replaces current memory DB with the backup. Continue?")) return;
  const formData = new FormData();
  formData.append("file", input.files[0]);
  await fetch("/restore", { method: "POST", body: formData });
  alert("Memory restored. Reloading...");
  location.reload();
}

// ---- Init ----
loadSettings();
loadHistory();
showInitialGreeting();
loadStreak();
checkHealth();
setInterval(checkHealth, 15000);

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
userInput.addEventListener("input", resetIdleTimer);
resetIdleTimer();
