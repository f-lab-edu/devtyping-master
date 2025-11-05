import { StateManager, stateManager } from "../state";
import type { WordState } from "../../types";
import {
  SPEED_CONVERSION_FACTOR,
  WORD_BANK,
  WORD_BOTTOM_OFFSET,
  WORD_WIDTH_PER_CHAR,
  WORD_BASE_PADDING,
  WORD_SPAWN_PADDING,
  WORD_SPAWN_Y,
  POINTS_PER_WORD,
  RANDOM_ID_SLICE_START,
  RANDOM_ID_SLICE_END,
  DIFFICULTY_SPEED_RANGES,
} from "../constants";

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

    // 텍스트 길이에 따라 대략적인 너비 계산
    const estimatedWordWidth = text.length * WORD_WIDTH_PER_CHAR + WORD_BASE_PADDING;

    const minX = WORD_SPAWN_PADDING;
    const maxX = Math.max(minX, areaWidth - estimatedWordWidth - WORD_SPAWN_PADDING);
    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

    const wordState: WordState = {
      id: this.generateWordId(),
      text,
      x,
      y: WORD_SPAWN_Y,
      speed: this.getRandomSpeed(),
      missed: false,
    };

    this.stateManager.updateGame(g => g.words.push(wordState));
  }

  public submitTypedWord(inputValue: string): { success: boolean; wordId?: string } {
    const game = this.stateManager.snapshot.game;
    if (!game?.running) return { success: false };

    const value = inputValue.trim();
    if (!value) return { success: false };

    const matchIndex = game.words.findIndex(word => word.text === value);
    if (matchIndex >= 0) {
      const matched = game.words[matchIndex];
      if (!matched) return { success: false };

      const matchedId = matched.id;
      this.stateManager.updateGame(g => {
        g.words.splice(matchIndex, 1);
        g.score += POINTS_PER_WORD;
        g.hits += 1;
        g.lastHitWordId = matchedId;
      });

      return { success: true, wordId: matchedId };
    } else {
      // 오기입 처리
      this.stateManager.updateGame(g => {
        g.misses += 1;
        g.score = Math.max(0, g.score - 5); // 5점 감점
      });
      return { success: false };
    }
  }

  //단어 스킵 버튼 호출 :: 로직만으로 분리
  public skipBottomWord(): string | null {
    const game = this.stateManager.snapshot.game;
    if (!game || game.words.length === 0) return null;

    const bottomIdx = this.findBottomWordIndex(game.words);
    const skipped = game.words[bottomIdx];
    if (!skipped) return null;

    const skippedId = skipped.id;
    this.stateManager.updateGame(g => {
      g.words.splice(bottomIdx, 1);
      g.misses += 1;
      g.lastMissWordId = skippedId;
    });

    return skippedId;
  }

  // 바닥에 가장 가까운 단어의 인덱스 찾기
  private findBottomWordIndex(words: WordState[]): number {
    if (words.length === 0) return -1;

    let bottomIdx = 0;
    const firstWord = words[0];
    if (!firstWord) return -1;

    let maxY = firstWord.y;
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
      word.y += (word.speed * delta) / SPEED_CONVERSION_FACTOR;

      if (word.y >= reachedBottom && !word.missed) {
        // 바닥에 닿았지만 아직 missed 표시 안됨 -> 첫 감지
        word.missed = true; // 플래그 설정 (중복 miss 방지)
        this.stateManager.updateGame(g => {
          g.misses += 1;
          g.lastMissWordId = word.id; // 👈 이펙트를 위한 id 설정
        });
      }

      remaining.push(word);
    }

    this.stateManager.updateGame(g => {
      g.words = remaining;
    });
  }

  private generateWordId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(RANDOM_ID_SLICE_START, RANDOM_ID_SLICE_END);
  }
  private getRandomSpeed(): number {
    // const game = this.stateManager.snapshot.game;
    // if (!game) return;
    const wordSpeed = this.stateManager.snapshot.difficulty;
    // const [min, max] = WORD_SPEED_RANGE[wordSpeed];
    const [min, max] = DIFFICULTY_SPEED_RANGES[wordSpeed];

    return Math.random() * (max - min) + min;
  }
}
export const gameEngine = new GameEngine(stateManager);
