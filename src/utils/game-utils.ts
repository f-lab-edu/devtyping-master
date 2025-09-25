import { stateManager } from "../core/state";

// 타이머 표시 업데이트
export function updateTimer(now: number): void {
  if (!stateManager.snapshot.game) return;

  const remaining = Math.max(0, Math.round((stateManager.snapshot.game.endsAt - now) / 100) / 10);
  stateManager.snapshot.game.timerDisplay.textContent = remaining.toFixed(1) + "s";
}

// 점수 표시 업데이트
export function updateScore(): void {
  if (!stateManager.snapshot.game) return;
  stateManager.snapshot.game.scoreDisplay.textContent = stateManager.snapshot.game.score.toString();
}

// 정확도 표시 업데이트
export function updateAccuracy(): void {
  if (!stateManager.snapshot.game) return;

  const total = stateManager.snapshot.game.hits + stateManager.snapshot.game.misses;
  const value = total === 0 ? 100 : Math.round((stateManager.snapshot.game.hits / total) * 100);
  stateManager.snapshot.game.accuracyDisplay.textContent = value + "%";
}
