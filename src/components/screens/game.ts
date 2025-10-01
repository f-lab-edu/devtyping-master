import { GAME_DURATION_MS } from "../../core/constants";
import { markMiss, submitTypedWord } from "../../core/game";
import { startGameLoop, startSpawningWords } from "../../core/game";
import { updateAccuracy } from "../../utils";

import { stateManager } from "../../core/state";
import { createStatBlock } from "../ui";

export function renderGameScreen(container: HTMLElement): void {
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "main-card screen";
  card.setAttribute("data-screen", "game");

  const header = document.createElement("div");
  header.className = "game-header";

  const playerStat = createStatBlock("플레이어", stateManager.snapshot.playerName);
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

  container.appendChild(card);

  stateManager.setGame({
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
  });

  typingInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitTypedWord();
    }
  });

  skipButton.addEventListener("click", () => {
    const g = stateManager.snapshot.game;
    if (!g || g.words.length === 0) return;

    // 바닥에 가장 가까운 단어의 인덱스 찾기
    let bottomIdx = 0;
    let maxY = g.words[0].y;
    for (let i = 1; i < g.words.length; i++) {
      if (g.words[i].y > maxY) {
        maxY = g.words[i].y;
        bottomIdx = i;
      }
    }

    stateManager.updateGame(game => {
      const skipped = game.words[bottomIdx];
      if (!skipped) return;
      game.words.splice(bottomIdx, 1);
      markMiss(skipped);
    });

    g.input.value = "";
    g.input.focus();
  });

  typingInput.focus();
  startSpawningWords();
  startGameLoop();
}
