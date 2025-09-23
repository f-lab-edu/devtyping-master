import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameEngine } from "@/app/game/engine";
import { GameScreen } from "@/app/screens/gameScreen";

const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

describe("GameEngine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.requestAnimationFrame = cb => {
      const id = window.setTimeout(() => cb(performance.now()), 16);
      return id;
    };
    window.cancelAnimationFrame = id => {
      window.clearTimeout(id);
    };
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    document.body.innerHTML = "";
  });

  it("awards points when a typed word matches", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);

    const screen = new GameScreen();
    screen.mount(host);
    screen.reset("테스터");

    const events = {
      onTimerChange: vi.fn(),
      onScoreChange: vi.fn(),
      onAccuracyChange: vi.fn(),
      onFinish: vi.fn()
    };

    const engine = new GameEngine(screen, events, {
      wordBank: ["vitest"],
      durationMs: 10_000,
      spawnIntervalMs: 60_000
    });

    engine.start();

    engine.submitWord("vitest");

    expect(events.onScoreChange).toHaveBeenLastCalledWith(10);
    expect(events.onAccuracyChange).toHaveBeenLastCalledWith(100);

    engine.stop();
  });
});
