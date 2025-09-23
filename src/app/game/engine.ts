import { CLEAR_SCORE, GAME_DURATION_MS, WORD_BANK, WORD_SPAWN_INTERVAL_MS, WORD_SPEED_RANGE } from "../constants";
import { GameResult, GameWordState } from "../state/types";
import { GameScreen } from "../screens/gameScreen";

interface GameEvents {
  onTimerChange(seconds: number): void;
  onScoreChange(score: number): void;
  onAccuracyChange(percentage: number): void;
  onFinish(result: GameResult): void;
}

interface GameConfig {
  durationMs: number;
  spawnIntervalMs: number;
  speedRange: readonly [number, number];
  wordBank: readonly string[];
  clearScore: number;
}

interface InternalState {
  startedAt: number;
  endsAt: number;
  score: number;
  hits: number;
  misses: number;
  words: GameWordState[];
}

export class GameEngine {
  private readonly screen: GameScreen;
  private readonly events: GameEvents;
  private readonly config: GameConfig;
  private state: InternalState | null = null;
  private spawnTimerId: number | null = null;
  private animationFrameId: number | null = null;
  private lastFrame = 0;
  private running = false;

  constructor(screen: GameScreen, events: GameEvents, config?: Partial<GameConfig>) {
    this.screen = screen;
    this.events = events;
    this.config = {
      durationMs: GAME_DURATION_MS,
      spawnIntervalMs: WORD_SPAWN_INTERVAL_MS,
      speedRange: WORD_SPEED_RANGE,
      wordBank: WORD_BANK,
      clearScore: CLEAR_SCORE,
      ...config
    };
  }

  start(): void {
    this.stop();

    this.state = {
      startedAt: performance.now(),
      endsAt: performance.now() + this.config.durationMs,
      score: 0,
      hits: 0,
      misses: 0,
      words: []
    };

    this.running = true;
    this.lastFrame = this.state.startedAt;

    this.events.onScoreChange(0);
    this.events.onAccuracyChange(100);
    this.events.onTimerChange(this.config.durationMs / 1000);

    this.spawnWord();
    this.spawnTimerId = window.setInterval(() => this.spawnWord(), this.config.spawnIntervalMs);
    this.animationFrameId = window.requestAnimationFrame(timestamp => this.loop(timestamp));
  }

  stop(): void {
    if (this.spawnTimerId !== null) {
      window.clearInterval(this.spawnTimerId);
      this.spawnTimerId = null;
    }

    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.state) {
      this.state.words.forEach(word => word.element.remove());
      this.state = null;
    }

    this.running = false;
  }

  submitWord(rawValue: string): void {
    if (!this.running || !this.state) {
      return;
    }

    const value = rawValue.trim();
    if (!value) {
      return;
    }

    const matchIndex = this.state.words.findIndex(word => word.text === value);
    if (matchIndex >= 0) {
      const matched = this.state.words.splice(matchIndex, 1)[0];
      this.screen.markHit(matched.element);
      this.state.score += 10;
      this.state.hits += 1;
      this.events.onScoreChange(this.state.score);
      this.updateAccuracy();
    } else {
      this.state.misses += 1;
      this.updateAccuracy();
    }
  }

  skipWord(): void {
    if (!this.running || !this.state) {
      return;
    }

    if (this.state.words.length === 0) {
      this.state.misses += 1;
      this.updateAccuracy();
      return;
    }

    const skipped = this.state.words.shift();
    if (skipped) {
      this.handleMiss(skipped);
    }
  }

  private loop(timestamp: number): void {
    if (!this.running || !this.state) {
      return;
    }

    const delta = timestamp - this.lastFrame;
    this.lastFrame = timestamp;

    this.updateWords(delta);
    this.updateTimer(timestamp);

    if (!this.running) {
      return;
    }

    this.animationFrameId = window.requestAnimationFrame(next => this.loop(next));
  }

  private updateTimer(now: number): void {
    if (!this.state) {
      return;
    }

    const remaining = Math.max(0, this.state.endsAt - now);
    this.events.onTimerChange(Math.round(remaining / 100) / 10);

    if (remaining <= 0) {
      this.finish();
    }
  }

  private updateWords(delta: number): void {
    if (!this.state) {
      return;
    }

    const area = this.screen.getAreaElement();
    const areaHeight = area.clientHeight;
    const reachedBottom = areaHeight - 34;
    const survivors: GameWordState[] = [];

    for (const word of this.state.words) {
      word.y += (word.speed * delta) / 1000;

      if (word.y >= reachedBottom) {
        this.handleMiss(word);
        continue;
      }

      word.element.style.top = word.y + "px";
      survivors.push(word);
    }

    this.state.words = survivors;
  }

  private spawnWord(): void {
    if (!this.state) {
      return;
    }

    const text = this.randomWord();
    const element = document.createElement("div");
    element.className = "word";
    element.textContent = text;
    element.style.top = "-40px";

    const area = this.screen.getAreaElement();
    area.appendChild(element);

    const areaWidth = area.clientWidth;
    const wordWidth = element.offsetWidth || 80;
    const maxX = Math.max(0, areaWidth - wordWidth - 16);
    const x = Math.floor(Math.random() * (maxX + 1)) + 8;
    element.style.left = x + "px";

    const wordState: GameWordState = {
      id: this.generateId(),
      text,
      x,
      y: -40,
      speed: this.randomSpeed(),
      element,
      missed: false
    };

    this.state.words.push(wordState);
  }

  private handleMiss(word: GameWordState): void {
    if (!this.state || word.missed) {
      return;
    }

    word.missed = true;
    this.screen.markMiss(word.element);
    this.state.misses += 1;
    this.updateAccuracy();
  }

  private updateAccuracy(): void {
    if (!this.state) {
      return;
    }

    const total = this.state.hits + this.state.misses;
    const value = total === 0 ? 100 : Math.round((this.state.hits / total) * 100);
    this.events.onAccuracyChange(value);
  }

  private finish(): void {
    if (!this.state || !this.running) {
      return;
    }

    this.running = false;

    if (this.spawnTimerId !== null) {
      window.clearInterval(this.spawnTimerId);
      this.spawnTimerId = null;
    }

    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.state.words.forEach(word => word.element.remove());

    this.events.onTimerChange(0);

    const result: GameResult = {
      score: this.state.score,
      hits: this.state.hits,
      misses: this.state.misses
    };

    this.state = null;

    this.events.onFinish(result);
  }

  private randomSpeed(): number {
    const [min, max] = this.config.speedRange;
    return Math.random() * (max - min) + min;
  }

  private randomWord(): string {
    const pool = this.config.wordBank;
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
}
