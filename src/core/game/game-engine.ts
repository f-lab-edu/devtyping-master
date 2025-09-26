import { stateManager } from "../state";
import { WordState } from "../../types";
import { WORD_BANK, WORD_SPEED_RANGE } from "../constants";
import { updateAccuracy } from "../../utils";

export function spawnWord() {
  const game = stateManager.snapshot.game;
  if (!game?.running) return;
  // NOSONAR - Using Math.random() is safe for game word selection
  const text = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  const wordElement = createWordElement(text);

  const areaWidth = game.area.clientWidth;
  const wordWidth = wordElement.offsetWidth || 80;
  const maxX = Math.max(0, areaWidth - wordWidth - 16);
  // NOSONAR - Using Math.random() is safe for game word selection
  const x = Math.floor(Math.random() * (maxX + 1)) + 8;
  wordElement.style.left = x + "px";

  const wordState: WordState = {
    id: generateWordId(),
    text,
    x,
    y: -40,
    speed: getRandomSpeed(),
    element: wordElement,
    missed: false,
  };
  stateManager.updateGame(g => g.words.push(wordState));
}

export function createWordElement(text: string) {
  const wordElement = document.createElement("div");
  wordElement.className = "word";
  wordElement.textContent = text;
  wordElement.style.top = "-40px";
  if (stateManager.snapshot.game) {
    stateManager.snapshot.game.area.appendChild(wordElement);
  }

  return wordElement;
}

function generateWordId(): string {
  // NOSONAR - Using Math.random() is safe for game word selection
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getRandomSpeed(): number {
  const [min, max] = WORD_SPEED_RANGE;
  // NOSONAR - Using Math.random() is safe for game word selection
  return Math.random() * (max - min) + min;
}

export function submitTypedWord() {
  const game = stateManager.snapshot.game;
  if (!game?.running) return;

  const value = game.input.value.trim();
  if (!value) {
    return;
  }

  const matchIndex = game.words.findIndex(word => word.text === value);

  if (matchIndex >= 0) {
    handleCorrectWord(matchIndex);
  } else {
    handleIncorrectWord();
  }

  game.input.value = "";
  game.input.focus();
}

function handleCorrectWord(matchIndex: number): void {
  const game = stateManager.snapshot.game;
  if (!game) return;

  let matched: WordState | undefined;
  stateManager.updateGame(g => {
    matched = g.words.splice(matchIndex, 1)[0];
    g.score += 10;
    g.hits += 1;
  });
  if (matched) {
    matched?.element.classList.add("hit");
    setTimeout(() => matched!.element.remove(), 180);
  }

  updateScore();
  updateAccuracy();
}

function handleIncorrectWord(): void {
  if (!stateManager.snapshot.game) return;

  stateManager.updateGame(g => {
    g.misses += 1;
  });

  updateAccuracy();
}

function updateScore(): void {
  if (!stateManager.snapshot.game) return;
  stateManager.snapshot.game.scoreDisplay.textContent = stateManager.snapshot.game.score.toString();
}
// 단어들 위치 업데이트 (게임 루프에서 호출)
export function updateWords(delta: number): void {
  const game = stateManager.snapshot.game;
  if (!game) return;

  const areaHeight = game.area.clientHeight;
  const remaining: WordState[] = [];
  const reachedBottom = areaHeight - 34;

  for (const word of game.words) {
    // 속도 계산 수정 (1000으로 나누기)
    word.y += (word.speed * delta) / 1000;

    if (word.y >= reachedBottom) {
      markMiss(word);
      continue;
    }

    word.element.style.top = word.y + "px";
    remaining.push(word);
  }

  stateManager.updateGame(g => {
    g.words = remaining;
  });
}

// 놓친 단어 처리
export function markMiss(word: WordState): void {
  if (!stateManager.snapshot.game || !word || word.missed) return;

  word.missed = true;
  word.element.classList.add("miss");

  setTimeout(() => {
    word.element.parentNode?.removeChild(word.element);
  }, 240);

  stateManager.updateGame(g => {
    g.misses += 1;
  });
  updateAccuracy(); // 이미 game-logic.ts에 있음
}
