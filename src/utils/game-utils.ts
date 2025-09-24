import { state } from "../core/state";

// 타이머 표시 업데이트
export function updateTimer(now: number): void {
  if (!state.game) return;

  const remaining = Math.max(0, Math.round((state.game.endsAt - now) / 100) / 10);
  state.game.timerDisplay.textContent = remaining.toFixed(1) + "s";
}

// 점수 표시 업데이트
export function updateScore(): void {
  if (!state.game) return;
  state.game.scoreDisplay.textContent = state.game.score.toString();
}

// 정확도 표시 업데이트
export function updateAccuracy(): void {
  if (!state.game) return;

  const total = state.game.hits + state.game.misses;
  const value = total === 0 ? 100 : Math.round((state.game.hits / total) * 100);
  state.game.accuracyDisplay.textContent = value + "%";
}
