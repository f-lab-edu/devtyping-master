import { gameTimer } from "../../core/game";
import { stateManager } from "../../core/state";
import { calculateAccuracy, getGameOutcome, saveScore, getRankings, getPersonalBest } from "../../utils";
import { createResultRow } from "../ui";

export function renderResultScreen(container: HTMLElement): void {
  const { result, playerName, difficulty } = stateManager.snapshot;
  container.innerHTML = "";

  if (!result) return;

  // 점수 저장
  const accuracyValue = calculateAccuracy(result.hits, result.misses);
  saveScore({
    playerName,
    score: result.score,
    accuracy: accuracyValue,
    difficulty,
    timestamp: Date.now(),
  });

  const card = document.createElement("div");
  card.className = "main-card screen";

  const outcomeBadge = document.createElement("div");
  outcomeBadge.className = "badge";
  const outcome = getGameOutcome(result.score);
  outcomeBadge.textContent = outcome;

  const title = document.createElement("h1");
  title.textContent = playerName + " 님의 결과";

  const subtitle = document.createElement("p");
  subtitle.textContent =
    outcome === "CLEAR" ? "축하합니다! 목표 점수를 달성했습니다." : "다음에는 더 높은 점수에 도전해보세요.";

  const resultScore = document.createElement("div");
  resultScore.className = "result-score";
  resultScore.textContent = result.score + "점";

  const details = document.createElement("div");
  details.className = "result-details";

  details.appendChild(createResultRow("정확히 친 단어", result.hits + " 개"));
  details.appendChild(createResultRow("놓친 단어", result.misses + " 개"));
  details.appendChild(createResultRow("정확도", accuracyValue + "%"));

  // 개인 최고 기록 표시
  const personalBest = getPersonalBest(playerName);
  if (personalBest && personalBest.score !== result.score) {
    details.appendChild(createResultRow("개인 최고 기록", personalBest.score + "점"));
  }

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

  // 랭킹 표시
  const rankings = getRankings();
  if (rankings.length > 0) {
    const rankingCard = document.createElement("div");
    rankingCard.className = "main-card ranking-card";

    const rankingTitle = document.createElement("h2");
    rankingTitle.textContent = "🏆 명예의 전당";
    rankingCard.appendChild(rankingTitle);

    const rankingList = document.createElement("div");
    rankingList.className = "ranking-list";

    rankings.forEach((record, index) => {
      const rankItem = document.createElement("div");
      rankItem.className = `ranking-item ${record.playerName === playerName && record.score === result.score && record.timestamp === Date.now() ? "current" : ""}`;

      const rank = document.createElement("span");
      rank.className = "rank";
      rank.textContent = `${index + 1}위`;

      const name = document.createElement("span");
      name.className = "player-name";
      name.textContent = record.playerName;

      const scoreSpan = document.createElement("span");
      scoreSpan.className = "score";
      scoreSpan.textContent = `${record.score}점`;

      const difficultyBadge = document.createElement("span");
      difficultyBadge.className = `difficulty-badge ${record.difficulty}`;
      difficultyBadge.textContent = record.difficulty.toUpperCase();

      rankItem.appendChild(rank);
      rankItem.appendChild(name);
      rankItem.appendChild(difficultyBadge);
      rankItem.appendChild(scoreSpan);
      rankingList.appendChild(rankItem);
    });

    rankingCard.appendChild(rankingList);
    container.appendChild(rankingCard);
  }

  retryButton.addEventListener("click", () => {
    gameTimer.clearAllTimers();
    stateManager.resetGameState(false);
    gameTimer.startCountdown();
  });

  renameButton.addEventListener("click", () => {
    gameTimer.clearAllTimers();
    stateManager.resetGameState(true);
    stateManager.setView("name");
  });
}
