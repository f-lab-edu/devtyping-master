import { GAME_DURATION_MS } from "../../core/constants";
import { gameEngine, gameTimer } from "../../core/game";
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
  const timerDisplay = timerStat.querySelector(".stat-value")! as HTMLElement;
  const scoreStat = createStatBlock("점수", "0");
  const scoreDisplay = scoreStat.querySelector(".stat-value")! as HTMLElement;

  header.appendChild(playerStat);
  header.appendChild(timerStat);
  header.appendChild(scoreStat);

  const accuracyBlock = createStatBlock("정확도", "100%");
  const accuracyDisplay = accuracyBlock.querySelector(".stat-value")! as HTMLElement;

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
    skipButton: skipButton,
    timerDisplay: timerDisplay,
    scoreDisplay: scoreDisplay,
    accuracyDisplay: accuracyDisplay,
    running: true,
  });

  typingInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      gameEngine.submitTypedWord();
    }
  });

  skipButton.addEventListener("click", () => {
    gameEngine.skipBottomWord();
  });

  typingInput.focus();
  gameTimer.startSpawningWords();
  gameTimer.startGameLoop();
}
