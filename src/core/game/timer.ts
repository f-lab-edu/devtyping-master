import { COUNTDOWN_START } from "../constants";
import { stateManager } from "../state";
import { spawnWord, updateWords } from "./game-engine";
import { updateTimer } from "../../utils";

// 활성화된 타이머 ID를 추적
interface TimerManager {
  countdownId: ReturnType<typeof setInterval> | null;
  spawnId: ReturnType<typeof setInterval> | null;
  animationId: number | null;
}

const timers: TimerManager = {
  countdownId: null,
  spawnId: null,
  animationId: null,
};
// 화면을 다시 그릴 때 사용할 앱 컨테이너
let appContainer: HTMLElement | null = null;

export function setAppContainer(container: HTMLElement): void {
  appContainer = container;
}

// 카운트다운 시작
export function startCountdown(): void {
  clearCountdownTimer();

  stateManager.setCountdown(COUNTDOWN_START);
  stateManager.setView("countdown");

  timers.countdownId = setInterval(() => {
    const current = stateManager.tickCountdown();

    if (current < 0) {
      clearCountdownTimer();
      stateManager.setView("game");
      startSpawningWords();
      startGameLoop();
    }
  }, 1000);
}

export function startSpawningWords(): void {
  spawnWord();
  timers.spawnId = setInterval(spawnWord, 2000);
}

export function startGameLoop(): void {
  let lastFrame = performance.now();

  const loop = (now: number) => {
    if (!stateManager.snapshot.game?.running) {
      return;
    }

    const delta = now - lastFrame;
    lastFrame = now;

    updateWords(delta);
    updateTimer(now);

    if (now >= stateManager.snapshot.game.endsAt) {
      finishGame();
      return;
    }

    timers.animationId = requestAnimationFrame(loop);
  };

  timers.animationId = requestAnimationFrame(loop);
}

// 타이머별 정리 함수
export function clearCountdownTimer(): void {
  if (timers.countdownId) {
    clearInterval(timers.countdownId);
    timers.countdownId = null;
  }
}
export function clearSpawnTimer(): void {
  if (timers.spawnId) {
    clearInterval(timers.spawnId);
    timers.spawnId = null;
  }
}

export function clearAnimationTimer(): void {
  if (timers.animationId) {
    cancelAnimationFrame(timers.animationId);
    timers.animationId = null;
  }
}

// 모든 타이머 정리
export function clearAllTimers(): void {
  clearCountdownTimer();
  clearSpawnTimer();
  clearAnimationTimer();
}

// 게임 종료 처리
export function finishGame(): void {
  const game = stateManager.snapshot.game;
  if (!game?.running) return;

  stateManager.updateGame(g => {
    g.running = false;
  });

  // 모든 타이머 정리
  clearAllTimers();

  // 결과 저장
  const { score, hits, misses, words } = stateManager.snapshot.game!;
  // 남은 단어들 정리
  words.forEach(word => {
    word.element.parentNode?.removeChild(word.element);
  });

  stateManager.setGameResult(score, hits, misses);
  stateManager.setView("result");
}
