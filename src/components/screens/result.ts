import { gameTimer } from "../../core/game";
import { stateManager } from "../../core/state";
import { calculateAccuracy, getGameOutcome } from "../../utils";
import { createResultRow } from "../ui";

export function renderResultScreen(container: HTMLElement): void {
  const { result, playerName } = stateManager.snapshot;
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "main-card screen";

  const outcomeBadge = document.createElement("div");
  outcomeBadge.className = "badge";
  const outcome = getGameOutcome(result!);
  outcomeBadge.textContent = outcome;

  const title = document.createElement("h1");
  title.textContent = playerName + " 님의 결과";

  const subtitle = document.createElement("p");
  subtitle.textContent =
    outcome === "CLEAR" ? "축하합니다! 목표 점수를 달성했습니다." : "다음에는 더 높은 점수에 도전해보세요.";

  const resultScore = document.createElement("div");
  resultScore.className = "result-score";
  resultScore.textContent = result!.score + "점";

  const details = document.createElement("div");
  details.className = "result-details";

  const accuracyValue = calculateAccuracy(result!);

  details.appendChild(createResultRow("정확히 친 단어", result!.hits + " 개"));
  details.appendChild(createResultRow("놓친 단어", result!.misses + " 개"));
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
  container.appendChild(card);

  retryButton.addEventListener("click", () => {
    stateManager.resetGameState({ resetName: false });
    gameTimer.startCountdown();
  });

  renameButton.addEventListener("click", () => {
    stateManager.resetGameState({ resetName: true });
    stateManager.setView("name");
  });
}
