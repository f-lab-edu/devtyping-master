import type { AppState, Difficulty, GameState } from "../../types";
import { COUNTDOWN_START } from "../constants";

export class StateManager {
  private state: AppState;
  private listeners: Array<() => void> = []; //화면전환용
  private gameListeners: Array<() => void> = []; //게임용

  constructor() {
    this.state = {
      view: "name", //현재 화면상태
      playerName: "",
      difficulty: "normal",
      countdownValue: COUNTDOWN_START,
      game: null,
      result: null,
    };
  }

  subscribe(fn: () => void) {
    this.listeners.push(fn);
    // 구독 차단  return  :: 현재는 사용 안함
    return () => {
      this.listeners = this.listeners.filter(f => f !== fn);
    };
  }
  subscribeGame(fn: () => void) {
    this.gameListeners.push(fn);
    // 구독 차단  return  :: 현재는 사용 안함
    return () => {
      this.gameListeners = this.gameListeners.filter(f => f !== fn);
    };
  }

  private notify() {
    for (const fn of this.listeners) fn();
  }
  private notifyGame() {
    for (const fn of this.gameListeners) fn();
  }

  // getter (읽기 전용 접근)
  get snapshot(): Readonly<AppState> {
    return this.state;
  }

  // 상태 업데이트 함수들
  setPlayerName(name: string): void {
    this.state.playerName = name;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.state.difficulty = difficulty;
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
    this.notifyGame();
  }

  // ✅ 게임 상태 일부 변경(뮤테이터 패턴)
  updateGame(mutator: (g: GameState) => void) {
    if (!this.state.game) return;
    mutator(this.state.game);
    this.notifyGame();
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

  resetGameState(resetName: boolean = false): void {
    // 상태 초기화
    this.state.game = null;
    this.state.result = null;
    this.state.countdownValue = COUNTDOWN_START;

    if (resetName) {
      this.state.playerName = "";
      this.state.difficulty = "normal";
    }

    this.notifyGame();
  }
}
export const stateManager = new StateManager();
