const TOTAL_QUESTIONS = 60;
const CHOICES = ["ア", "イ", "ウ", "エ"];
const STORAGE_KEY = "fe_completion_exam_answers_v1";
const MARK_KEY = "fe_completion_exam_marks_v1";
const START_KEY = "fe_completion_exam_started_at_v1";

const state = {
  current: 1,
  filter: "all",
  zoom: 100,
  answers: loadJson(STORAGE_KEY, {}),
  marks: loadJson(MARK_KEY, {}),
};

const els = {
  grid: document.getElementById("questionGrid"),
  image: document.getElementById("questionImage"),
  title: document.getElementById("questionTitle"),
  progressText: document.getElementById("progressText"),
  progressFill: document.getElementById("progressFill"),
  timerText: document.getElementById("timerText"),
  markButton: document.getElementById("markButton"),
  prevButton: document.getElementById("prevButton"),
  nextButton: document.getElementById("nextButton"),
  clearButton: document.getElementById("clearButton"),
  zoomInButton: document.getElementById("zoomInButton"),
  zoomOutButton: document.getElementById("zoomOutButton"),
  zoomText: document.getElementById("zoomText"),
  reviewButton: document.getElementById("reviewButton"),
  resetButton: document.getElementById("resetButton"),
  reviewDialog: document.getElementById("reviewDialog"),
  reviewList: document.getElementById("reviewList"),
  copyButton: document.getElementById("copyButton"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  choiceButtons: Array.from(document.querySelectorAll(".choice-button")),
};

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function padQuestion(num) {
  return String(num).padStart(2, "0");
}

function questionImagePath(num) {
  return `assets/mon${padQuestion(num)}.png`;
}

function ensureTimerStart() {
  if (!localStorage.getItem(START_KEY)) {
    localStorage.setItem(START_KEY, String(Date.now()));
  }
}

function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimer() {
  const startedAt = Number(localStorage.getItem(START_KEY) || Date.now());
  els.timerText.textContent = formatElapsed(Date.now() - startedAt);
}

function buildGrid() {
  els.grid.innerHTML = "";
  for (let i = 1; i <= TOTAL_QUESTIONS; i += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "q-cell";
    button.textContent = i;
    button.dataset.question = String(i);
    button.addEventListener("click", () => setCurrent(i));
    els.grid.appendChild(button);
  }
}

function visibleByFilter(num) {
  if (state.filter === "unanswered") return !state.answers[num];
  if (state.filter === "marked") return Boolean(state.marks[num]);
  return true;
}

function renderGrid() {
  Array.from(els.grid.children).forEach((button) => {
    const num = Number(button.dataset.question);
    button.classList.toggle("current", num === state.current);
    button.classList.toggle("answered", Boolean(state.answers[num]));
    button.classList.toggle("marked", Boolean(state.marks[num]));
    button.hidden = !visibleByFilter(num);
    const answer = state.answers[num] ? ` 回答${state.answers[num]}` : " 未回答";
    const mark = state.marks[num] ? " 見直し" : "";
    button.setAttribute("aria-label", `問${num}${answer}${mark}`);
  });
}

function renderProgress() {
  const answered = Object.keys(state.answers).filter((key) => state.answers[key]).length;
  const percent = Math.round((answered / TOTAL_QUESTIONS) * 100);
  els.progressText.textContent = `${answered} / ${TOTAL_QUESTIONS}`;
  els.progressFill.style.width = `${percent}%`;
}

function renderQuestion() {
  els.title.textContent = `問${state.current}`;
  els.image.src = questionImagePath(state.current);
  els.image.alt = `問${state.current}の問題画像`;
  els.image.style.setProperty("--image-width", `${state.zoom}%`);
  els.zoomText.textContent = `${state.zoom}%`;
  els.markButton.classList.toggle("active", Boolean(state.marks[state.current]));
  els.markButton.textContent = state.marks[state.current] ? "見直し中" : "見直し";
  els.prevButton.disabled = state.current === 1;
  els.nextButton.disabled = state.current === TOTAL_QUESTIONS;

  els.choiceButtons.forEach((button) => {
    button.classList.toggle("selected", state.answers[state.current] === button.dataset.choice);
  });
}

function renderTabs() {
  els.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.filter === state.filter);
  });
}

function render() {
  renderQuestion();
  renderGrid();
  renderProgress();
  renderTabs();
}

function setCurrent(num) {
  state.current = Math.min(TOTAL_QUESTIONS, Math.max(1, num));
  render();
}

function answerCurrent(choice) {
  state.answers[state.current] = choice;
  saveJson(STORAGE_KEY, state.answers);
  if (state.current < TOTAL_QUESTIONS) {
    state.current += 1;
  }
  render();
}

function clearCurrent() {
  delete state.answers[state.current];
  saveJson(STORAGE_KEY, state.answers);
  render();
}

function toggleMark() {
  if (state.marks[state.current]) {
    delete state.marks[state.current];
  } else {
    state.marks[state.current] = true;
  }
  saveJson(MARK_KEY, state.marks);
  render();
}

function setZoom(nextZoom) {
  state.zoom = Math.min(160, Math.max(70, nextZoom));
  renderQuestion();
}

function buildReviewList() {
  els.reviewList.innerHTML = "";
  for (let i = 1; i <= TOTAL_QUESTIONS; i += 1) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "review-item";
    item.innerHTML = `<strong>問${i}</strong><span>${state.answers[i] || "未回答"}${state.marks[i] ? " / 見直し" : ""}</span>`;
    item.addEventListener("click", () => {
      state.current = i;
      els.reviewDialog.close();
      render();
    });
    els.reviewList.appendChild(item);
  }
}

function exportCsv() {
  const rows = ["question,answer,marked"];
  for (let i = 1; i <= TOTAL_QUESTIONS; i += 1) {
    rows.push(`${i},${state.answers[i] || ""},${state.marks[i] ? "1" : "0"}`);
  }
  return rows.join("\n");
}

function resetAll() {
  const ok = window.confirm("解答、見直し、タイマーをリセットしますか。");
  if (!ok) return;
  state.answers = {};
  state.marks = {};
  state.current = 1;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(MARK_KEY);
  localStorage.setItem(START_KEY, String(Date.now()));
  render();
  updateTimer();
}

function bindEvents() {
  els.choiceButtons.forEach((button) => {
    button.addEventListener("click", () => answerCurrent(button.dataset.choice));
  });

  els.prevButton.addEventListener("click", () => setCurrent(state.current - 1));
  els.nextButton.addEventListener("click", () => setCurrent(state.current + 1));
  els.clearButton.addEventListener("click", clearCurrent);
  els.markButton.addEventListener("click", toggleMark);
  els.zoomInButton.addEventListener("click", () => setZoom(state.zoom + 10));
  els.zoomOutButton.addEventListener("click", () => setZoom(state.zoom - 10));
  els.resetButton.addEventListener("click", resetAll);

  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.filter = tab.dataset.filter;
      render();
    });
  });

  els.reviewButton.addEventListener("click", () => {
    buildReviewList();
    els.reviewDialog.showModal();
  });

  els.copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(exportCsv());
    els.copyButton.textContent = "コピー済み";
    window.setTimeout(() => {
      els.copyButton.textContent = "CSVをコピー";
    }, 1200);
  });

  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === "ArrowLeft") setCurrent(state.current - 1);
    if (event.key === "ArrowRight") setCurrent(state.current + 1);
    if (event.key === "m") toggleMark();
    const index = Number(event.key) - 1;
    if (index >= 0 && index < CHOICES.length) {
      answerCurrent(CHOICES[index]);
    }
  });
}

ensureTimerStart();
buildGrid();
bindEvents();
render();
updateTimer();
window.setInterval(updateTimer, 1000);
