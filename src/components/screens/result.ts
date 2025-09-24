import { CLEAR_SCORE } from "../../core/constants";
import { startCountdown } from "../../core/game";
import { resetGameState, setView, state } from "../../core/state";
import { createResultRow } from "../ui";

export function renderResultScreen(container: HTMLElement): void {
  container.innerHTML = "";

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
  container.appendChild(card);

  retryButton.addEventListener("click", () => {
    resetGameState(false);
    startCountdown();
  });

  renameButton.addEventListener("click", () => {
    resetGameState(true);
    setView("name");
  });
}
