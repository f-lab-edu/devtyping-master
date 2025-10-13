import type { WordState } from "../../types";
import { WORD_SPAWN_Y } from "../constants";

export class GameRenderer {
  constructor(private gameArea: HTMLElement) {}

  // 단어 DOM 요소 생성
  public createWordElement(text: string, x: number): HTMLDivElement {
    const wordElement = document.createElement("div");
    wordElement.className = "word";
    wordElement.textContent = text;
    wordElement.style.top = `${WORD_SPAWN_Y}px`;
    wordElement.style.left = `${x}px`;

    this.gameArea.appendChild(wordElement);
    return wordElement;
  }
  // 단어 위치 업데이트
  public updateWordPosition(word: WordState): void {
    word.element.style.top = word.y + "px";
  }

  // 정답
  public showHitEffect(element: HTMLDivElement): void {
    element.classList.add("hit");
    setTimeout(() => element.remove(), 180);
  }

  // 오답
  public showMissEffect(element: HTMLDivElement): void {
    element.classList.add("miss");
    setTimeout(() => {
      element.parentNode?.removeChild(element);
    }, 240);
  }

  // 점수 표시 업데이트
  public updateScoreDisplay(scoreElement: HTMLElement, score: number): void {
    scoreElement.textContent = score.toString();
  }

  // 정확도 표시 업데이트
  public updateAccuracyDisplay(accuracyElement: HTMLElement, accuracy: number): void {
    accuracyElement.textContent = accuracy + "%";
  }

  // Skip 버튼 업데이트
  public updateSkipButton(skipButton: HTMLButtonElement, hasWords: boolean): void {
    skipButton.disabled = !hasWords;
  }
}
