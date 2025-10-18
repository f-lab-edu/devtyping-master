import { COUNTDOWN_START, SPEED_CONVERSION_FACTOR, WORD_SPAWN_INTERVAL_MS } from "../constants";
import { stateManager, StateManager } from "../state";
import { gameEngine, GameEngine } from "./game-engine";

export class GameTimer {
  private countdownId: ReturnType<typeof setInterval> | null = null;
  private spawnId: ReturnType<typeof setInterval> | null = null;
  private animationId: number | null = null;
  private lastFrame: number = 0;

  constructor(private stateManager: StateManager, private gameEngine: GameEngine) {}

  // ===== COUNTDOWN Methods =====
  // 카운트다운 시작
  public startCountdown(): void {
    this.clearCountdownTimer();

    this.stateManager.setCountdown(COUNTDOWN_START);
    this.stateManager.setView("countdown");

    this.countdownId = setInterval(() => {
      const current = this.stateManager.tickCountdown();

      if (current < 0) {
        this.clearCountdownTimer();
        this.stateManager.setView("game");
      }
    }, SPEED_CONVERSION_FACTOR);
  }

  // ===== GAME Methods =====
  //단어 생성기 시작
  public startSpawningWords(): void {
    this.clearSpawnTimer(); //중복방지
    this.gameEngine.spawnWord();
    this.spawnId = setInterval(() => this.gameEngine.spawnWord(), WORD_SPAWN_INTERVAL_MS);
  }

  //단어 루프 애니메이션
  public startGameLoop(): void {
    this.lastFrame = performance.now();
    this.animationId = requestAnimationFrame(this.gameLoop); //this를 강제로 고정
  }

  // 모든 타이머 정리
  public clearAllTimers(): void {
    this.clearCountdownTimer();
    this.clearSpawnTimer();
    this.clearAnimationTimer();
  }

  // 게임 종료 처리
  public finishGame(): void {
    const game = this.stateManager.snapshot.game;
    if (!game?.running) return;

    this.stateManager.updateGame(g => {
      g.running = false;
    });

    // 모든 타이머 정리
    this.clearAllTimers();

    // 결과 저장
    const { score, hits, misses } = this.stateManager.snapshot.game!;

    this.stateManager.setGameResult(score, hits, misses);
    this.stateManager.setView("result");
  }

  // ===== Private Methods =====
  // 타이머별 정리 함수
  private clearCountdownTimer(): void {
    if (this.countdownId) {
      clearInterval(this.countdownId);
      this.countdownId = null;
    }
  }
  private clearSpawnTimer(): void {
    if (this.spawnId) {
      clearInterval(this.spawnId);
      this.spawnId = null;
    }
  }

  private clearAnimationTimer(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private gameLoop = (now: number): void => {
    if (!this.stateManager.snapshot.game?.running) {
      return;
    }

    const delta = now - this.lastFrame; // ✅ 클래스 멤버 사용
    this.lastFrame = now;

    this.gameEngine.updateWords(delta);
    this.updateTimer(now);
    //게임종료
    if (now >= this.stateManager.snapshot.game.endsAt) {
      this.finishGame();
      return;
    }

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  // 타이머 표시 업데이트
  private updateTimer(now: number): void {
    const game = this.stateManager.snapshot.game;
    if (!game?.running) return;

    const remaining = Math.max(0, Math.round((game.endsAt - now) / 100) / 10);

    this.stateManager.updateGame(g => {
      g.remainingTime = remaining;
    });
  }
}

export const gameTimer = new GameTimer(stateManager, gameEngine);
