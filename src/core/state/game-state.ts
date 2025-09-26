import type { AppState, GameState } from "../../types";
import { COUNTDOWN_START } from "../constants";

export class StateManager {
  private state: AppState;

  // 구독자 목록
  private listeners: Array<() => void> = [];

  constructor() {
    this.state = {
      view: "name", //현재 화면상태
      playerName: "",
      countdownValue: COUNTDOWN_START,
      game: null,
      result: null,
    };
  }

  subscribe(fn: () => void) {
    this.listeners.push(fn); //명단추가
    return () => {
      this.listeners = this.listeners.filter(f => f !== fn); //구독취소
    };
  }
  private notify() {
    for (const fn of this.listeners) fn();
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
    this.notify();
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
    this.notify();
  }

  /** 1 감소시키고, 감소 후 값을 반환 */
  tickCountdown(): number {
    this.state.countdownValue -= 1;
    this.notify();
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
