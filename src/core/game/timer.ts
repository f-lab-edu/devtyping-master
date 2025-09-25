import { COUNTDOWN_START } from "../constants";
import { renderCountdownScreen } from "../../components/screens";
import { stateManager } from "../state";
import { finishGame, updateWords } from "./game-engine";
import { updateTimer } from "../../utils";

// 타이머 ID들을 관리하는 객체
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
// 앱 컨테이너를 저장할 변수
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

    if (current >= 0) {
      if (appContainer) {
        renderCountdownScreen(appContainer); // ✅ 타입스크립트가 여기서는 HTMLElement임을 인식
      }
    }

    if (current < 0) {
      clearCountdownTimer();
      stateManager.setView("game");
    }
  }, 1000);
}

export function startSpawningWords(): void {
  const { spawnWord } = require("./game-logic"); // 순환 참조 방지

  spawnWord();
  timers.spawnId = setInterval(spawnWord, 2000); // WORD_SPAWN_INTERVAL_MS
}

export function startGameLoop(): void {
  let lastFrame = performance.now();

  const loop = (now: number) => {
    if (!stateManager.snapshot.game || !stateManager.snapshot.game.running) {
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
// 타이머들 개별 정리 함수들
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
