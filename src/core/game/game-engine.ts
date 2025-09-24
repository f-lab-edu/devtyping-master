import { setView, state } from "../state";
import { WordState } from "../../types";
import { WORD_BANK, WORD_SPEED_RANGE } from "../constants";
import { clearAllTimers } from "./timer";
import { updateAccuracy } from "../../utils";

export function spawnWord() {
  if (!state.game || !state.game.running) {
    return;
  }

  const text = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  const wordElement = createWordElement(text);

  const areaWidth = state.game.area.clientWidth;
  const wordWidth = wordElement.offsetWidth || 80;
  const maxX = Math.max(0, areaWidth - wordWidth - 16);
  const x = Math.floor(Math.random() * (maxX + 1)) + 8;
  wordElement.style.left = x + "px";

  const wordState: WordState = {
    id: generateWordId(),
    text,
    x: calculateRandomX(wordElement),
    y: -40,
    speed: getRandomSpeed(),
    element: wordElement,
    missed: false,
  };

  state.game.words.push(wordState);
}

export function createWordElement(text: string) {
  const wordElement = document.createElement("div");
  wordElement.className = "word";
  wordElement.textContent = text;
  wordElement.style.top = "-40px";
  if (state.game) {
    state.game.area.appendChild(wordElement);
  }

  return wordElement;
}

function generateWordId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function calculateRandomX(element: HTMLDivElement): number {
  if (!state.game) return 0;

  const areaWidth = state.game.area.clientWidth;
  const wordWidth = element.offsetWidth || 80;
  const maxX = Math.max(0, areaWidth - wordWidth - 16);
  return Math.floor(Math.random() * (maxX + 1)) + 8;
}

function getRandomSpeed(): number {
  const [min, max] = WORD_SPEED_RANGE;
  return Math.random() * (max - min) + min;
}

export function submitTypedWord() {
  if (!state.game || !state.game.running) {
    return;
  }

  const value = state.game.input.value.trim();
  if (!value) {
    return;
  }

  const matchIndex = state.game.words.findIndex(word => word.text === value);

  if (matchIndex >= 0) {
    handleCorrectWord(matchIndex);
  } else {
    handleIncorrectWord();
  }

  state.game.input.value = "";
  state.game.input.focus();
}
function handleCorrectWord(matchIndex: number): void {
  if (!state.game) return;

  const matched = state.game.words.splice(matchIndex, 1)[0];
  matched.element.classList.add("hit");
  setTimeout(() => matched.element.remove(), 180);

  state.game.score += 10;
  state.game.hits += 1;

  updateScore();
  updateAccuracy();
}

function handleIncorrectWord(): void {
  if (!state.game) return;

  state.game.misses += 1;
  updateAccuracy();
}

function updateScore(): void {
  if (!state.game) return;
  state.game.scoreDisplay.textContent = state.game.score.toString();
}
// 단어들 위치 업데이트 (게임 루프에서 호출)
export function updateWords(delta: number): void {
  if (!state.game) return;

  const areaHeight = state.game.area.clientHeight;
  const remaining: WordState[] = [];
  const reachedBottom = areaHeight - 34;

  for (const word of state.game.words) {
    // 속도 계산 수정 (1000으로 나누기)
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

// 놓친 단어 처리
export function markMiss(word: WordState): void {
  if (!state.game || !word || word.missed) return;

  word.missed = true;
  word.element.classList.add("miss");

  setTimeout(() => {
    if (word.element && word.element.parentNode) {
      word.element.parentNode.removeChild(word.element);
    }
  }, 240);

  state.game.misses += 1;
  updateAccuracy(); // 이미 game-logic.ts에 있음
}

// 게임 종료 처리
export function finishGame(): void {
  if (!state.game || !state.game.running) return;

  state.game.running = false;

  // 모든 타이머 정리
  clearAllTimers();

  // 결과 저장
  const summary = {
    score: state.game.score,
    hits: state.game.hits,
    misses: state.game.misses,
  };

  // 남은 단어들 정리
  state.game.words.forEach(word => {
    if (word.element && word.element.parentNode) {
      word.element.parentNode.removeChild(word.element);
    }
  });

  state.result = summary;
  setView("result");
}
