import { StateManager, stateManager } from "../state";
import type { WordState } from "../../types";
import { SPEED_CONVERSION_FACTOR, WORD_BANK, WORD_BOTTOM_OFFSET, WORD_SPAWN_Y, WORD_SPEED_RANGE } from "../constants";
import { calculateAccuracy } from "../../utils";

export class GameEngine {
  constructor(private stateManager: StateManager) {}

  public spawnWord(): void {
    const game = this.stateManager.snapshot.game;
    if (!game?.running) return;

    const randomText = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    if (!randomText) return;

    const text = randomText;
    const wordElement = this.createWordElement(text);

    const areaWidth = game.area.clientWidth;
    const wordWidth = wordElement.offsetWidth || 80;
    const maxX = Math.max(0, areaWidth - wordWidth - 16);

    const x = Math.floor(Math.random() * (maxX + 1)) + 8;
    wordElement.style.left = x + "px";

    const wordState: WordState = {
      id: this.generateWordId(),
      text,
      x,
      y: -40,
      speed: this.getRandomSpeed(),
      element: wordElement,
      missed: false,
    };
    this.stateManager.updateGame(g => g.words.push(wordState));
  }
  public submitTypedWord(): void {
    const game = this.stateManager.snapshot.game;
    if (!game?.running) return;

    const value = game.input.value.trim();
    if (!value) {
      return;
    }

    const matchIndex = game.words.findIndex(word => word.text === value);

    if (matchIndex >= 0) {
      this.handleCorrectWord(matchIndex);
    } else {
      this.handleIncorrectWord();
    }

    game.input.value = "";
    game.input.focus();
  }
  //단어 스킵 버튼 호출
  public skipBottomWord() {
    const g = this.stateManager.snapshot.game;
    if (!g || g.words.length === 0) return;
    const bottomIdx = this.findBottomWordIndex(g.words);

    this.stateManager.updateGame(game => {
      const skipped = game.words[bottomIdx];
      if (!skipped) return;
      game.words.splice(bottomIdx, 1);
      gameEngine.markMiss(skipped);
    });

    g.input.value = "";
    g.input.focus();
  }

  // 단어들 위치 업데이트 (게임 루프에서 호출)
  public updateWords(delta: number): void {
    const game = this.stateManager.snapshot.game;
    if (!game) return;

    const areaHeight = game.area.clientHeight;
    const remaining: WordState[] = [];
    const reachedBottom = areaHeight - WORD_BOTTOM_OFFSET;

    for (const word of game.words) {
      // 속도 계산 수정 (1000으로 나누기)
      word.y += (word.speed * delta) / SPEED_CONVERSION_FACTOR;

      if (word.y >= reachedBottom) {
        this.markMiss(word);
        continue;
      }

      word.element.style.top = word.y + "px";
      remaining.push(word);
    }

    this.stateManager.updateGame(g => {
      g.words = remaining;
    });

    // Skip 버튼 활성화/비활성화
    this.updateSkipButton();
  }

  // Skip 버튼 상태 업데이트
  public updateSkipButton(): void {
    const game = this.stateManager.snapshot.game;
    if (!game) return;

    game.skipButton.disabled = game.words.length === 0;
  }

  // 놓친 단어 처리
  public markMiss(word: WordState): void {
    if (!this.stateManager.snapshot.game || !word || word.missed) return;

    word.missed = true;
    word.element.classList.add("miss");

    setTimeout(() => {
      word.element.parentNode?.removeChild(word.element);
    }, 240);

    this.stateManager.updateGame(g => {
      g.misses += 1;
    });
    this.updateAccuracy(); // 이미 game-logic.ts에 있음
  }

  private createWordElement(text: string) {
    const wordElement = document.createElement("div");
    wordElement.className = "word";
    wordElement.textContent = text;
    wordElement.style.top = `${WORD_SPAWN_Y}px`;
    if (this.stateManager.snapshot.game) {
      this.stateManager.snapshot.game.area.appendChild(wordElement);
    }

    return wordElement;
  }
  private generateWordId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  private getRandomSpeed(): number {
    const [min, max] = WORD_SPEED_RANGE;

    return Math.random() * (max - min) + min;
  }
  private handleCorrectWord(matchIndex: number): void {
    const game = this.stateManager.snapshot.game;
    if (!game) return;

    let matched: WordState | undefined;
    this.stateManager.updateGame(g => {
      matched = g.words.splice(matchIndex, 1)[0];
      g.score += 10;
      g.hits += 1;
    });
    if (matched) {
      matched.element.classList.add("hit");
      setTimeout(() => matched!.element.remove(), 180);
    }

    this.updateScore();
    this.updateAccuracy();
    this.updateSkipButton();
  }
  private handleIncorrectWord(): void {
    if (!this.stateManager.snapshot.game) return;

    this.stateManager.updateGame(g => {
      g.misses += 1;
    });

    this.updateAccuracy();
  }

  // 점수 표시 업데이트
  private updateScore(): void {
    if (!this.stateManager.snapshot.game) return;
    this.stateManager.snapshot.game.scoreDisplay.textContent = this.stateManager.snapshot.game.score.toString();
  }

  // 정확도 표시 업데이트
  private updateAccuracy(): void {
    const game = this.stateManager.snapshot.game;
    if (!game) return;

    const accuracy = calculateAccuracy(game.hits, game.misses);
    game.accuracyDisplay.textContent = accuracy + "%";
  }

  // 바닥에 가장 가까운 단어의 인덱스 찾기
  private findBottomWordIndex(words: WordState[]): number {
    if (words.length === 0) return -1;

    let bottomIdx = 0;
    let maxY = words[0]!.y;
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      if (word && word.y > maxY) {
        maxY = word.y;
        bottomIdx = i;
      }
    }
    return bottomIdx;
  }
}
export const gameEngine = new GameEngine(stateManager);
