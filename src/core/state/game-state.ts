import type { AppState, GameState } from "../../types";
import { COUNTDOWN_START } from "../constants";
import { clearAllTimers } from "../game";

// export const state: AppState = {
//   view: "name",
//   playerName: "",
//   countdownValue: COUNTDOWN_START,
//   game: null,
//   result: null,
// };

// // 상태 업데이트 함수들
// export function setPlayerName(name: string): void {
//   state.playerName = name;
// }

// export function setView(view: AppState["view"]): void {
//   state.view = view;
// }

// export function setGameResult(score: number, hits: number, misses: number): void {
//   state.result = { score, hits, misses };
// }

// export function resetGame(): void {
//   state.game = null;
//   state.result = null;
//   state.countdownValue = COUNTDOWN_START;
// }

// export function resetGameState(resetName: boolean = false): void {
//   // 모든 타이머 정리
//   clearAllTimers();

//   // 남은 단어들 DOM에서 제거
//   if (state.game && state.game.words) {
//     state.game.words.forEach(word => {
//       if (word.element && word.element.parentNode) {
//         word.element.parentNode.removeChild(word.element);
//       }
//     });
//   }

//   // 상태 초기화
//   state.game = null;
//   state.result = null;
//   state.countdownValue = COUNTDOWN_START;

//   if (resetName) {
//     state.playerName = "";
//   }
// }

export class StateManager {
  private state: AppState;

  constructor() {
    this.state = {
      view: "name",
      playerName: "",
      countdownValue: COUNTDOWN_START,
      game: null,
      result: null,
    };
  }

  // getter (읽기 전용 접근)
  get snapshot(): Readonly<AppState> {
    return this.state;
  }

  // 상태 업데이트 함수들
  setPlayerName(name: string): void {
    this.state.playerName = name;
  }

  setView(view: AppState["view"]): void {
    this.state.view = view;
  }

  setGameResult(score: number, hits: number, misses: number): void {
    this.state.result = { score, hits, misses };
  }
  // ✅ 게임 상태 설정(초기화 용)
  setGame(next: GameState): void {
    this.state.game = next;
  }

  // ✅ 게임 상태 일부 변경(뮤테이터 패턴)
  updateGame(mutator: (g: GameState) => void) {
    if (!this.state.game) return;
    mutator(this.state.game);
  }

  // ✅ 카운트다운 전용 메서드들
  setCountdown(value: number): void {
    this.state.countdownValue = value;
  }

  /** 1 감소시키고, 감소 후 값을 반환 */
  tickCountdown(): number {
    this.state.countdownValue -= 1;
    return this.state.countdownValue;
  }

  resetGame(): void {
    this.state.game = null;
    this.state.result = null;
    this.state.countdownValue = COUNTDOWN_START;
  }

  resetGameState(options?: {
    resetName?: boolean;
    onBeforeClear?: () => void;
    onClearWords?: (words: GameState["words"]) => void;
  }): void {
    const { resetName = false, onBeforeClear, onClearWords } = options ?? {};

    //타이머 초기화
    onBeforeClear?.();

    // 남은 단어들 DOM에서 제거
    if (this.state.game?.words) {
      onClearWords?.(this.state.game.words);
    }

    // 상태 초기화
    this.state.game = null;
    this.state.result = null;
    this.state.countdownValue = COUNTDOWN_START;

    if (resetName) {
      this.state.playerName = "";
    }
  }
}
export const stateManager = new StateManager();
