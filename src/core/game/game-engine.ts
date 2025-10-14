import { StateManager, stateManager } from "../state";
import type { WordState } from "../../types";
import { SPEED_CONVERSION_FACTOR, WORD_BANK, WORD_BOTTOM_OFFSET, WORD_SPEED_RANGE } from "../constants";
import { calculateAccuracy } from "../../utils";

//dom 요소 없이 로직만
export class GameEngine {
  constructor(private stateManager: StateManager) {}

  //단어 생성기 시작되면 게임의 단어 생성 :: 단어 데이터만 WordState로 보내
  public spawnWord(): void {
    const game = this.stateManager.snapshot.game;
    if (!game?.running) return;

    const text = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    if (!text) return;

    const areaWidth = game.area.clientWidth;
    const wordWidth = game.area.offsetWidth || 80;
    const maxX = Math.max(0, areaWidth - wordWidth - 16);
    const x = Math.floor(Math.random() * (maxX + 1)) + 8;

    //단어생성해서보내요
    const wordState: WordState = {
      id: this.generateWordId(),
      text,
      x,
      y: -40,
      speed: this.getRandomSpeed(),
      missed: false,
    };
    this.stateManager.updateGame(g => g.words.push(wordState));
  }

  public submitTypedWord(): string | null {
    const game = this.stateManager.snapshot.game;
    if (!game?.running) return null;

    const value = game.input.value.trim();
    if (!value) return null;

    const matchIndex = game.words.findIndex(word => word.text === value);

    if (matchIndex >= 0) {
      const matched = game.words[matchIndex];
      this.stateManager.updateGame(g => {
        g.words.splice(matchIndex, 1);
        g.score += 10;
        g.hits += 1;
      });

      game.input.value = "";
      game.input.focus();

      return matched!.id; // ✅ id 반환
    } else {
      this.stateManager.updateGame(g => {
        g.misses += 1;
      });

      game.input.value = "";
      game.input.focus();

      return null;
    }
  }

  //단어 스킵 버튼 호출 :: 로직만으로 분리
  public skipBottomWord(): string | null {
    const game = this.stateManager.snapshot.game;
    if (!game || game.words.length === 0) return null;

    const bottomIdx = this.findBottomWordIndex(game.words);
    const skipped = game.words[bottomIdx];
    if (!skipped) return null;

    this.stateManager.updateGame(g => {
      g.words.splice(bottomIdx, 1);
      g.misses += 1;
      // gameEngine.markMiss(skipped);
    });

    game.input.value = "";
    game.input.focus();

    return skipped.id; //skip된 id반환
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
        this.markMiss(word.id);
        continue;
      }

      // this.renderer.updateWordPosition(word);
      remaining.push(word);
    }

    this.stateManager.updateGame(g => {
      g.words = remaining;
    });

    // Skip 버튼 활성화/비활성화
    // this.updateSkipButton();
  }

  // // Skip 버튼 상태 업데이트
  // public updateSkipButton(): void {
  //   const game = this.stateManager.snapshot.game;
  //   if (!game) return;

  //   this.renderer.updateSkipButton(game.skipButton, game.words.length > 0);
  // }

  // 놓친 단어 처리
  private markMiss(wordId: string): void {
    // if (!this.stateManager.snapshot.game || !word || word.missed) return;

    // word.missed = true;
    // this.renderer.showMissEffect(word.element);

    // this.stateManager.updateGame(g => {
    //   g.misses += 1;
    // });
    // this.updateAccuracy(); // 이미 game-logic.ts에 있음
    const game = this.stateManager.snapshot.game;
    if (!game) return;

    const word = game.words.find(w => w.id === wordId);
    if (!word || word.missed) return;

    this.stateManager.updateGame(g => {
      const w = g.words.find(w => w.id === wordId);
      if (w) {
        w.missed = true;
        g.misses += 1;
      }
    });
  }

  private generateWordId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  private getRandomSpeed(): number {
    const [min, max] = WORD_SPEED_RANGE;

    return Math.random() * (max - min) + min;
  }

  // // 점수 표시 업데이트
  // private updateScore(): void {
  //   const game = this.stateManager.snapshot.game;
  //   if (!game) return;

  //   this.renderer.updateScoreDisplay(game.scoreDisplay, game.score);
  // }

  // // 정확도 표시 업데이트
  // private updateAccuracy(): void {
  //   const game = this.stateManager.snapshot.game;
  //   if (!game) return;

  //   const accuracy = calculateAccuracy(game.hits, game.misses);
  //   this.renderer.updateAccuracyDisplay(game.accuracyDisplay, accuracy);
  // }
}
export const gameEngine = new GameEngine(stateManager);
