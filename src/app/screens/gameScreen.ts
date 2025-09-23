import { BaseScreen } from "./baseScreen";

interface GameScreenCallbacks {
  onSubmit(value: string): void;
  onSkip(): void;
}

export class GameScreen extends BaseScreen {
  private readonly playerValue: HTMLSpanElement;
  private readonly timerDisplay: HTMLSpanElement;
  private readonly scoreDisplay: HTMLSpanElement;
  private readonly accuracyDisplay: HTMLSpanElement;
  private readonly area: HTMLDivElement;
  private readonly input: HTMLInputElement;
  private readonly skipButton: HTMLButtonElement;
  private callbacks: GameScreenCallbacks | null = null;

  constructor() {
    super("main-card", "screen");
    this.root.dataset.screen = "game";

    const header = document.createElement("div");
    header.className = "game-header";

    const playerStat = this.createStatBlock("플레이어", "-");
    this.playerValue = playerStat.querySelector(".stat-value") as HTMLSpanElement;

    const timerStat = this.createStatBlock("남은 시간", "60.0s");
    this.timerDisplay = timerStat.querySelector(".stat-value") as HTMLSpanElement;

    const scoreStat = this.createStatBlock("점수", "0");
    this.scoreDisplay = scoreStat.querySelector(".stat-value") as HTMLSpanElement;

    header.appendChild(playerStat);
    header.appendChild(timerStat);
    header.appendChild(scoreStat);

    const accuracyBlock = this.createStatBlock("정확도", "100%");
    this.accuracyDisplay = accuracyBlock.querySelector(".stat-value") as HTMLSpanElement;

    this.area = document.createElement("div");
    this.area.className = "game-area";
    this.area.id = "game-area";

    const inputWrap = document.createElement("div");
    inputWrap.className = "game-input";

    this.input = document.createElement("input");
    this.input.id = "typing-input";
    this.input.type = "text";
    this.input.placeholder = "단어를 입력하고 Enter를 누르시오";
    this.input.autocomplete = "off";
    this.input.spellcheck = false;

    this.skipButton = document.createElement("button");
    this.skipButton.id = "skip-button";
    this.skipButton.type = "button";
    this.skipButton.textContent = "스킵";

    inputWrap.appendChild(this.input);
    inputWrap.appendChild(this.skipButton);

    this.root.appendChild(header);
    this.root.appendChild(accuracyBlock);
    this.root.appendChild(this.area);
    this.root.appendChild(inputWrap);

    this.input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        const value = this.input.value.trim();
        if (!value) {
          return;
        }
        this.callbacks?.onSubmit(value);
      }
    });

    this.skipButton.addEventListener("click", () => {
      this.callbacks?.onSkip();
    });
  }

  setCallbacks(callbacks: GameScreenCallbacks): void {
    this.callbacks = callbacks;
  }

  reset(playerName: string): void {
    this.playerValue.textContent = playerName;
    this.setTimer(60);
    this.setScore(0);
    this.setAccuracy(100);
    this.clearInput();
    this.clearWords();
  }

  setTimer(seconds: number): void {
    this.timerDisplay.textContent = seconds.toFixed(1) + "s";
  }

  setScore(score: number): void {
    this.scoreDisplay.textContent = String(score);
  }

  setAccuracy(percentage: number): void {
    this.accuracyDisplay.textContent = percentage + "%";
  }

  focusInput(): void {
    window.requestAnimationFrame(() => this.input.focus());
  }

  clearInput(): void {
    this.input.value = "";
  }

  getAreaElement(): HTMLDivElement {
    return this.area;
  }

  clearWords(): void {
    while (this.area.firstChild) {
      this.area.removeChild(this.area.firstChild);
    }
  }

  markHit(element: HTMLDivElement): void {
    element.classList.add("hit");
    window.setTimeout(() => {
      element.remove();
    }, 180);
  }

  markMiss(element: HTMLDivElement): void {
    element.classList.add("miss");
    window.setTimeout(() => {
      element.remove();
    }, 240);
  }

  private createStatBlock(labelText: string, valueText: string): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.className = "stat-block";

    const label = document.createElement("span");
    label.className = "stat-label";
    label.textContent = labelText;

    const value = document.createElement("span");
    value.className = "stat-value";
    value.textContent = valueText;

    wrapper.appendChild(label);
    wrapper.appendChild(value);
    return wrapper;
  }
}
