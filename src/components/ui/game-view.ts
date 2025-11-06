import type { GameState, WordState } from "../../types";
import { calculateAccuracy } from "../../utils";
import { HIT_ANIMATION_DURATION, MISS_ANIMATION_DURATION } from "../../core/constants";

export class GameView {
  //id와 element로 구성된 wordElements배열
  private wordElements: Map<string, HTMLDivElement> = new Map();
  private animationTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();

  private lastProcessedHitId: string | null = null;
  private lastProcessedMissId: string | null = null;

  constructor(
    private gameArea: HTMLElement, //#game-area
    private scoreDisplay: HTMLElement,
    private accuracyDisplay: HTMLElement,
    private skipButton: HTMLButtonElement,
    private timerDisplay: HTMLElement,
  ) {}

  // ===== 메인 렌더링 메서드 =====
  public render(gameState: GameState): void {
    // ✅ 배열의 모든 hit을 처리
    for (const wordId of gameState.lastHitWordId) {
      if (wordId !== this.lastProcessedHitId) {
        this.showHitEffect(wordId);
        this.lastProcessedHitId = wordId;
      }
    }

    // ✅ 배열의 모든 miss를 처리
    for (const wordId of gameState.lastMissWordId) {
      if (wordId !== this.lastProcessedMissId) {
        this.showMissEffect(wordId);
        this.lastProcessedMissId = wordId;
      }
    }

    this.syncWords(gameState.words);
    this.updateUI(gameState);
  }

  //단어 동기화 :: words에서 slice된 단어 필터링해서 element 에서 삭제
  public syncWords(words: WordState[]): void {
    const currentIds = new Set(words.map(w => w.id));

    //words에 id가 없으면 제거
    for (const [id, element] of this.wordElements) {
      if (!currentIds.has(id)) {
        // 이펙트 처리 중인 element는 애니메이션 완료 후 제거됨
        if (element.classList.contains("hit") || element.classList.contains("miss")) {
          this.wordElements.delete(id);
          continue;
        }
        element.remove();
        this.wordElements.delete(id);
      }
    }

    for (const word of words) {
      let element = this.wordElements.get(word.id);

      if (!element) {
        //새 단어 생성
        element = this.createWordElements(word);
        this.wordElements.set(word.id, element);
      }
      // 위치 업데이트
      this.updateWordPosition(element, word);
    }
  }

  // ===== DOM 조작 메서드들 =====
  // 단어 DOM 요소 생성
  public createWordElements(word: WordState): HTMLDivElement {
    const element = document.createElement("div");
    element.className = "word";
    element.textContent = word.text;
    element.dataset.wordId = word.id;
    this.gameArea.appendChild(element);
    return element;
  }
  //좌표 위치
  public updateWordPosition(element: HTMLDivElement, word: WordState): void {
    element.style.left = `${word.x}px`;
    element.style.top = `${word.y}px`;
  }

  //단어맞춤
  public showHitEffect(wordId: string): void {
    const element = this.wordElements.get(wordId);
    if (!element) return;

    element.classList.add("hit");
    this.wordElements.delete(wordId);

    const timeoutId = setTimeout(() => {
      element.remove();
      this.animationTimeouts.delete(timeoutId);
    }, HIT_ANIMATION_DURATION);

    this.animationTimeouts.add(timeoutId);
  }
  //단어오류
  public showMissEffect(wordId: string): void {
    const element = this.wordElements.get(wordId);
    if (!element) return;

    element.classList.add("miss");
    this.wordElements.delete(wordId);

    const timeoutId = setTimeout(() => {
      element.remove();
      this.animationTimeouts.delete(timeoutId);
    }, MISS_ANIMATION_DURATION);

    this.animationTimeouts.add(timeoutId);
  }

  private updateUI(gameState: GameState): void {
    //점수
    this.scoreDisplay.textContent = gameState.score.toString();
    // 정확도
    const accuracy = calculateAccuracy(gameState.hits, gameState.misses);
    this.accuracyDisplay.textContent = accuracy + "%";

    // Skip 버튼
    this.skipButton.disabled = gameState.words.length === 0;
    this.timerDisplay.textContent = gameState.remainingTime.toFixed(1) + "s";
  }

  //클린업 함수
  public cleanUp(): void {
    // 모든 대기 중인 애니메이션 타임아웃 클리어
    for (const timeoutId of this.animationTimeouts) {
      clearTimeout(timeoutId);
    }
    this.animationTimeouts.clear();

    // 모든 DOM 요소 제거
    for (const element of this.wordElements.values()) {
      element.remove();
    }
    this.wordElements.clear();
  }
}
