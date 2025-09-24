interface WordState {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  element: HTMLDivElement;
  missed: boolean;
}

interface GameState {
  startedAt: number;
  endsAt: number;
  score: number;
  hits: number;
  misses: number;
  words: WordState[];
  area: HTMLDivElement;
  input: HTMLInputElement;
  timerDisplay: HTMLElement;
  scoreDisplay: HTMLElement;
  accuracyDisplay: HTMLElement;
  running: boolean;
}
interface AppState {
  view: "name" | "countdown" | "game" | "result";
  playerName: string;
  countdownValue: number;
  game: GameState | null;
  result: {
    score: number;
    hits: number;
    misses: number;
  } | null;
}

const app = document.getElementById("app") as HTMLElement;

const GAME_DURATION_MS: number = 60000;
const COUNTDOWN_START: number = 3;
const WORD_SPAWN_INTERVAL_MS: number = 2000;
const CLEAR_SCORE: number = 120;
const WORD_SPEED_RANGE: [number, number] = [70, 120];

const WORD_BANK: string[] = [
  "function",
  "variable",
  "object",
  "browser",
  "promise",
  "callback",
  "closure",
  "module",
  "async",
  "await",
  "event",
  "state",
  "render",
  "layout",
  "debug",
  "commit",
  "branch",
  "deploy",
  "refactor",
  "typing",
  "coding",
  "developer",
  "keyboard",
  "snippet",
  "canvas",
  "script",
  "string",
  "number",
  "boolean",
  "array",
  "method",
  "component",
  "props",
  "hook",
  "router",
];

const state: AppState = {
  view: "name",
  playerName: "",
  countdownValue: COUNTDOWN_START,
  game: null,
  result: null,
};

let countdownTimerId: ReturnType<typeof setInterval> | null = null;
let spawnTimerId: ReturnType<typeof setInterval> | null = null;
let animationFrameId: number | null = null;

function setView(nextView: AppState["view"]): void {
  state.view = nextView;
  render();
}

function render(): void {
  if (state.view === "name") {
    renderNameScreen();
  } else if (state.view === "countdown") {
    renderCountdownScreen();
  } else if (state.view === "game") {
    renderGameScreen();
  } else if (state.view === "result") {
    renderResultScreen();
  }
}

function renderNameScreen(): void {
  app.innerHTML = "";

  const card = document.createElement("div");
  card.className = "main-card screen";

  const header = document.createElement("div");
  const title = document.createElement("h1");
  title.textContent = "DevTyping Week 1";
  const description = document.createElement("p");
  description.textContent = "플레이어 이름을 입력하고 60초 타이핑 레이스를 시작하세요.";

  header.appendChild(title);
  header.appendChild(description);

  const form = document.createElement("form");
  form.id = "name-form";

  const label = document.createElement("label");
  label.setAttribute("for", "playerName");
  label.textContent = "플레이어 이름";

  const input = document.createElement("input");
  input.id = "playerName";
  input.name = "playerName";
  input.type = "text";
  input.required = true;
  input.placeholder = "예: 코딩라이언";

  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "게임 시작";

  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(button);

  card.appendChild(header);
  card.appendChild(form);
  app.appendChild(card);

  form.addEventListener("submit", (event: Event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
      input.focus();
      return;
    }

    state.playerName = value;
    startCountdown();
  });

  window.requestAnimationFrame(() => input.focus());
}

function renderCountdownScreen(): void {
  app.innerHTML = "";

  const card = document.createElement("div");
  card.className = "main-card screen";

  const title = document.createElement("h1");
  title.textContent = state.playerName + " 님, 준비되셨나요?";

  const description = document.createElement("p");
  description.textContent = "3 · 2 · 1 카운트다운 후 게임이 시작됩니다.";

  const number = document.createElement("div");
  number.className = "countdown-number";
  number.textContent = state.countdownValue > 0 ? String(state.countdownValue) : "START!";

  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(number);
  app.appendChild(card);
}

function renderGameScreen(): void {
  app.innerHTML = "";

  const card = document.createElement("div");
  card.className = "main-card screen";
  card.setAttribute("data-screen", "game");

  const header = document.createElement("div");
  header.className = "game-header";

  const playerStat = createStatBlock("플레이어", state.playerName);
  const timerStat = createStatBlock("남은 시간", "60.0s");
  timerStat.querySelector(".stat-value")!.id = "timer-display";
  const scoreStat = createStatBlock("점수", "0");
  scoreStat.querySelector(".stat-value")!.id = "score-display";

  header.appendChild(playerStat);
  header.appendChild(timerStat);
  header.appendChild(scoreStat);

  const accuracyBlock = createStatBlock("정확도", "100%");
  accuracyBlock.querySelector(".stat-value")!.id = "accuracy-display";

  const gameArea = document.createElement("div");
  gameArea.className = "game-area";
  gameArea.id = "game-area";

  const inputWrap = document.createElement("div");
  inputWrap.className = "game-input";

  const typingInput = document.createElement("input");
  typingInput.id = "typing-input";
  typingInput.type = "text";
  typingInput.placeholder = "단어를 입력하고 Enter를 누르세요";
  typingInput.autocomplete = "off";
  typingInput.spellcheck = false;

  const skipButton = document.createElement("button");
  skipButton.id = "skip-button";
  skipButton.type = "button";
  skipButton.textContent = "스킵";

  inputWrap.appendChild(typingInput);
  inputWrap.appendChild(skipButton);

  card.appendChild(header);
  card.appendChild(accuracyBlock);
  card.appendChild(gameArea);
  card.appendChild(inputWrap);

  app.appendChild(card);

  state.game = {
    startedAt: performance.now(),
    endsAt: performance.now() + GAME_DURATION_MS,
    score: 0,
    hits: 0,
    misses: 0,
    words: [],
    area: gameArea,
    input: typingInput,
    timerDisplay: document.getElementById("timer-display")!,
    scoreDisplay: document.getElementById("score-display")!,
    accuracyDisplay: document.getElementById("accuracy-display")!,
    running: true,
  };

  typingInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitTypedWord();
    }
  });

  skipButton.addEventListener("click", () => {
    if (!state.game) {
      return;
    }

    if (state.game.words.length === 0) {
      state.game.misses += 1;
      updateAccuracy();
      state.game.input.value = "";
      state.game.input.focus();
      return;
    }

    const skipped = state.game.words.shift();
    skipped && markMiss(skipped);
    state.game.input.value = "";
    state.game.input.focus();
  });

  typingInput.focus();
  startSpawningWords();
  startGameLoop();
}

function renderResultScreen(): void {
  app.innerHTML = "";

  const card = document.createElement("div");
  card.className = "main-card screen";

  const outcomeBadge = document.createElement("div");
  outcomeBadge.className = "badge";
  const outcome = state.result!.score >= CLEAR_SCORE ? "CLEAR" : "FAIL";
  outcomeBadge.textContent = outcome;

  const title = document.createElement("h1");
  title.textContent = state.playerName + " 님의 결과";

  const subtitle = document.createElement("p");
  subtitle.textContent =
    outcome === "CLEAR" ? "축하합니다! 목표 점수를 달성했습니다." : "다음에는 더 높은 점수에 도전해보세요.";

  const resultScore = document.createElement("div");
  resultScore.className = "result-score";
  resultScore.textContent = state.result!.score + "점";

  const details = document.createElement("div");
  details.className = "result-details";

  const accuracyValue =
    state.result!.hits + state.result!.misses === 0
      ? 100
      : Math.round((state.result!.hits / (state.result!.hits + state.result!.misses)) * 100);

  details.appendChild(createResultRow("정확히 친 단어", state.result!.hits + " 개"));
  details.appendChild(createResultRow("놓친 단어", state.result!.misses + " 개"));
  details.appendChild(createResultRow("정확도", accuracyValue + "%"));

  const retryButton = document.createElement("button");
  retryButton.id = "retry-button";
  retryButton.type = "button";
  retryButton.textContent = "다시 도전";

  const renameButton = document.createElement("button");
  renameButton.id = "rename-button";
  renameButton.type = "button";
  renameButton.textContent = "이름 다시 입력";

  card.appendChild(outcomeBadge);
  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(resultScore);
  card.appendChild(details);
  card.appendChild(retryButton);
  card.appendChild(renameButton);
  app.appendChild(card);

  retryButton.addEventListener("click", () => {
    resetGameState(false);
    startCountdown();
  });

  renameButton.addEventListener("click", () => {
    resetGameState(true);
    setView("name");
  });
}

function createStatBlock(labelText: string, valueText: string): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "stat-block";

  const label = document.createElement("span");
  label.className = "stat-label";
  label.textContent = labelText;

  const value = document.createElement("span");
  value.className = "stat-value";
  value.textContent = valueText;

  wrapper.appendChild(label);
  wrapper.appendChild(value);
  return wrapper;
}

function createResultRow(labelText: string, valueText: string): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "result-row";

  const label = document.createElement("span");
  label.textContent = labelText;

  const value = document.createElement("span");
  value.textContent = valueText;

  row.appendChild(label);
  row.appendChild(value);
  return row;
}

function startCountdown() {
  countdownTimerId && clearInterval(countdownTimerId);
  state.countdownValue = COUNTDOWN_START;
  setView("countdown");

  countdownTimerId = setInterval(() => {
    state.countdownValue -= 1;
    if (state.countdownValue >= 0) {
      renderCountdownScreen();
    }

    if (state.countdownValue < 0) {
      countdownTimerId && clearInterval(countdownTimerId);
      countdownTimerId = null;
      setView("game");
    }
  }, 1000);
}

function startSpawningWords() {
  spawnWord();
  spawnTimerId = setInterval(spawnWord, WORD_SPAWN_INTERVAL_MS);
}

function startGameLoop() {
  let lastFrame = performance.now();

  const loop = (now: number) => {
    if (!state.game || !state.game.running) {
      return;
    }

    const delta = now - lastFrame;
    lastFrame = now;

    updateWords(delta);
    updateTimer(now);

    if (now >= state.game.endsAt) {
      finishGame();
      return;
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);
}

function spawnWord() {
  if (!state.game || !state.game.running) {
    return;
  }

  const text = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  const wordElement = document.createElement("div");
  wordElement.className = "word";
  wordElement.textContent = text;
  wordElement.style.top = "-40px";

  state.game.area.appendChild(wordElement);

  const areaWidth = state.game.area.clientWidth;
  const wordWidth = wordElement.offsetWidth || 80;
  const maxX = Math.max(0, areaWidth - wordWidth - 16);
  const x = Math.floor(Math.random() * (maxX + 1)) + 8;
  wordElement.style.left = x + "px";

  const wordState = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text,
    x,
    y: -40,
    speed: getRandomSpeed(),
    element: wordElement,
    missed: false,
  };

  state.game.words.push(wordState);
}

function getRandomSpeed(): number {
  const min = WORD_SPEED_RANGE[0];
  const max = WORD_SPEED_RANGE[1];
  return Math.random() * (max - min) + min;
}

function updateWords(delta: number): void {
  if (!state.game) {
    return;
  }

  const areaHeight = state.game.area.clientHeight;
  const remaining = [];
  const reachedBottom = areaHeight - 34;

  for (const word of state.game.words) {
    word.y += (word.speed * delta) / 1000;

    if (word.y >= reachedBottom) {
      markMiss(word);
      continue;
    }

    word.element.style.top = word.y + "px";
    remaining.push(word);
  }

  state.game.words = remaining;
}

function submitTypedWord() {
  if (!state.game || !state.game.running) {
    return;
  }

  const value = state.game.input.value.trim();
  if (!value) {
    return;
  }

  const matchIndex = state.game.words.findIndex(word => word.text === value);

  if (matchIndex >= 0) {
    const matched = state.game.words.splice(matchIndex, 1)[0];
    matched.element.classList.add("hit");
    setTimeout(() => matched.element.remove(), 180);
    state.game.score += 10;
    state.game.hits += 1;
    updateScore();
    updateAccuracy();
  } else {
    state.game.misses += 1;
    updateAccuracy();
  }

  state.game.input.value = "";
  state.game.input.focus();
}

function markMiss(word: WordState): void {
  if (!state.game || !word || word.missed) {
    return;
  }

  word.missed = true;
  word.element.classList.add("miss");
  setTimeout(() => {
    if (word.element && word.element.parentNode) {
      word.element.parentNode.removeChild(word.element);
    }
  }, 240);

  state.game.misses += 1;
  updateAccuracy();
}

function updateTimer(now: number): void {
  if (!state.game) {
    return;
  }

  const remaining = Math.max(0, Math.round((state.game.endsAt - now) / 100) / 10);
  state.game.timerDisplay.textContent = remaining.toFixed(1) + "s";
}

function updateScore() {
  if (!state.game) {
    return;
  }

  state.game.scoreDisplay.textContent = String(state.game.score);
}

function updateAccuracy(): void {
  if (!state.game) {
    return;
  }

  const total = state.game.hits + state.game.misses;
  const value = total === 0 ? 100 : Math.round((state.game.hits / total) * 100);
  state.game.accuracyDisplay.textContent = value + "%";
}

function finishGame(): void {
  if (!state.game || !state.game.running) {
    return;
  }

  state.game.running = false;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (spawnTimerId) {
    clearInterval(spawnTimerId);
    spawnTimerId = null;
  }

  const summary = {
    score: state.game.score,
    hits: state.game.hits,
    misses: state.game.misses,
  };

  state.game.words.forEach(word => {
    if (word.element && word.element.parentNode) {
      word.element.parentNode.removeChild(word.element);
    }
  });

  state.result = summary;
  setView("result");
}

function resetGameState(resetName: boolean): void {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (countdownTimerId) {
    clearInterval(countdownTimerId);
    countdownTimerId = null;
  }

  if (spawnTimerId) {
    clearInterval(spawnTimerId);
    spawnTimerId = null;
  }

  if (state.game && state.game.words) {
    state.game.words.forEach(word => {
      if (word.element && word.element.parentNode) {
        word.element.parentNode.removeChild(word.element);
      }
    });
  }

  state.game = null;
  state.result = null;
  state.countdownValue = COUNTDOWN_START;

  if (resetName) {
    state.playerName = "";
  }
}

render();
