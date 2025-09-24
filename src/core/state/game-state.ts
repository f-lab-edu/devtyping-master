import { AppState } from "../../types";
import { COUNTDOWN_START } from "../constants";
import { clearAllTimers } from "../game";

export const state: AppState = {
  view: "name",
  playerName: "",
  countdownValue: COUNTDOWN_START,
  game: null,
  result: null,
};

// 상태 업데이트 함수들
export function setPlayerName(name: string): void {
  state.playerName = name;
}

export function setView(view: AppState["view"]): void {
  state.view = view;
}

export function setGameResult(score: number, hits: number, misses: number): void {
  state.result = { score, hits, misses };
}

export function resetGame(): void {
  state.game = null;
  state.result = null;
  state.countdownValue = COUNTDOWN_START;
}

export function resetGameState(resetName: boolean = false): void {
  // 모든 타이머 정리
  clearAllTimers();

  // 남은 단어들 DOM에서 제거
  if (state.game && state.game.words) {
    state.game.words.forEach(word => {
      if (word.element && word.element.parentNode) {
        word.element.parentNode.removeChild(word.element);
      }
    });
  }

  // 상태 초기화
  state.game = null;
  state.result = null;
  state.countdownValue = COUNTDOWN_START;

  if (resetName) {
    state.playerName = "";
  }
}
