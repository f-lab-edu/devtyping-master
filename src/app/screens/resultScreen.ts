import { GameResult } from "../state/types";
import { BaseScreen } from "./baseScreen";

interface ResultScreenCallbacks {
  onRetry(): void;
  onRename(): void;
}

export class ResultScreen extends BaseScreen {
  private readonly badge: HTMLDivElement;
  private readonly title: HTMLHeadingElement;
  private readonly subtitle: HTMLParagraphElement;
  private readonly scoreBlock: HTMLDivElement;
  private readonly hitsRow: HTMLDivElement;
  private readonly missesRow: HTMLDivElement;
  private readonly accuracyRow: HTMLDivElement;
  private readonly retryButton: HTMLButtonElement;
  private readonly renameButton: HTMLButtonElement;
  private callbacks: ResultScreenCallbacks | null = null;

  constructor() {
    super("main-card", "screen");

    this.badge = document.createElement("div");
    this.badge.className = "badge";

    this.title = document.createElement("h1");
    this.subtitle = document.createElement("p");

    this.scoreBlock = document.createElement("div");
    this.scoreBlock.className = "result-score";

    const details = document.createElement("div");
    details.className = "result-details";

    this.hitsRow = this.createResultRow("정확히 친 단어");
    this.missesRow = this.createResultRow("놓친 단어");
    this.accuracyRow = this.createResultRow("정확도");

    details.appendChild(this.hitsRow);
    details.appendChild(this.missesRow);
    details.appendChild(this.accuracyRow);

    this.retryButton = document.createElement("button");
    this.retryButton.id = "retry-button";
    this.retryButton.type = "button";
    this.retryButton.textContent = "다시 도전";

    this.renameButton = document.createElement("button");
    this.renameButton.id = "rename-button";
    this.renameButton.type = "button";
    this.renameButton.textContent = "이름 다시 입력";

    this.root.appendChild(this.badge);
    this.root.appendChild(this.title);
    this.root.appendChild(this.subtitle);
    this.root.appendChild(this.scoreBlock);
    this.root.appendChild(details);
    this.root.appendChild(this.retryButton);
    this.root.appendChild(this.renameButton);

    this.retryButton.addEventListener("click", () => this.callbacks?.onRetry());
    this.renameButton.addEventListener("click", () => this.callbacks?.onRename());
  }

  setCallbacks(callbacks: ResultScreenCallbacks): void {
    this.callbacks = callbacks;
  }

  showResult(playerName: string, result: GameResult, clearScore: number): void {
    const cleared = result.score >= clearScore;
    this.badge.textContent = cleared ? "CLEAR" : "FAIL";
    this.title.textContent = playerName + " 님의 결과";
    this.subtitle.textContent = cleared
      ? "축하하오! 목표 점수를 달성했음."
      : "다음에는 더 높은 점수를 노려보시오.";
    this.scoreBlock.textContent = result.score + "점";

    this.updateResultRow(this.hitsRow, result.hits + " 개");
    this.updateResultRow(this.missesRow, result.misses + " 개");

    const total = result.hits + result.misses;
    const accuracy = total === 0 ? 100 : Math.round((result.hits / total) * 100);
    this.updateResultRow(this.accuracyRow, accuracy + "%");
  }

  private createResultRow(label: string): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "result-row";

    const labelSpan = document.createElement("span");
    labelSpan.textContent = label;

    const valueSpan = document.createElement("span");
    valueSpan.textContent = "-";

    row.appendChild(labelSpan);
    row.appendChild(valueSpan);
    return row;
  }

  private updateResultRow(row: HTMLDivElement, valueText: string): void {
    const value = row.lastElementChild as HTMLSpanElement | null;
    if (value) {
      value.textContent = valueText;
    }
  }
}
