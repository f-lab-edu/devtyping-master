import { COUNTDOWN_START } from "../constants";
import { stateManager, StateManager } from "../state";
import { gameEngine, GameEngine } from "./game-engine";

export class GameTimer {
  private countdownId: ReturnType<typeof setInterval> | null = null;
  private spawnId: ReturnType<typeof setInterval> | null = null;
  private animationId: number | null = null;
  private lastFrame: number = 0; // ✅ 추

  constructor(private stateManager: StateManager, private gameEngine: GameEngine) {}

  // ===== Public Methods =====
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
    }, 1000);
  }
  //단어 생성기 시작
  public startSpawningWords(): void {
    this.clearSpawnTimer(); //중복방지
    this.gameEngine.spawnWord();
    this.spawnId = setInterval(() => this.gameEngine.spawnWord(), 2000);
  }

  public startGameLoop(): void {
    this.lastFrame = performance.now();
    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
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
    const { score, hits, misses, words } = this.stateManager.snapshot.game!;
    // 남은 단어들 정리
    words.forEach(word => {
      word.element.parentNode?.removeChild(word.element);
    });

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

  private gameLoop(now: number): void {
    if (!this.stateManager.snapshot.game?.running) {
      return;
    }

    const delta = now - this.lastFrame; // ✅ 클래스 멤버 사용
    this.lastFrame = now;

    this.gameEngine.updateWords(delta);
    this.updateTimer(now);

    if (now >= this.stateManager.snapshot.game.endsAt) {
      this.finishGame();
      return;
    }

    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  // 타이머 표시 업데이트
  private updateTimer(now: number): void {
    if (!this.stateManager.snapshot.game) return;

    const remaining = Math.max(0, Math.round((this.stateManager.snapshot.game.endsAt - now) / 100) / 10);
    this.stateManager.snapshot.game.timerDisplay.textContent = remaining.toFixed(1) + "s";
  }
}

export const gameTimer = new GameTimer(stateManager, gameEngine);
