import type { GameState, WordState } from "../../types";
import { calculateAccuracy } from "../../utils";

export class GameView {
  //id와 element로 구성된 wordElements배열
  private wordElements: Map<string, HTMLDivElement> = new Map();

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
    if (gameState.lastHitWordId && gameState.lastHitWordId !== this.lastProcessedHitId) {
      this.showHitEffect(gameState.lastHitWordId);
      this.lastProcessedHitId = gameState.lastHitWordId;
    }

    if (gameState.lastMissWordId && gameState.lastMissWordId !== this.lastProcessedMissId) {
      this.showMissEffect(gameState.lastMissWordId);
      this.lastProcessedMissId = gameState.lastMissWordId;
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
        // 이펙트 처리 중인 element는 보호
        if (element.classList.contains("hit") || element.classList.contains("miss")) {
          continue; // setTimeout이 삭제할 거예요
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
    setTimeout(() => {
      element.remove();
      this.wordElements.delete(wordId);
    }, 180);
  }
  //단어오류
  public showMissEffect(wordId: string): void {
    const element = this.wordElements.get(wordId);
    if (!element) return;

    element.classList.add("miss");
    setTimeout(() => {
      element.remove();
      this.wordElements.delete(wordId);
    }, 240);
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
    for (const element of this.wordElements.values()) {
      element.remove();
    }
    this.wordElements.clear();
  }
}
