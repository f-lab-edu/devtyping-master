import { BaseScreen } from "./baseScreen";

export class CountdownScreen extends BaseScreen {
  private readonly title: HTMLHeadingElement;
  private readonly description: HTMLParagraphElement;
  private readonly numberDisplay: HTMLDivElement;

  constructor() {
    super("main-card", "screen");

    this.title = document.createElement("h1");
    this.description = document.createElement("p");
    this.description.textContent = "3 · 2 · 1 카운트다운 후 게임이 시작되오.";

    this.numberDisplay = document.createElement("div");
    this.numberDisplay.className = "countdown-number";
    this.numberDisplay.textContent = "3";

    this.root.appendChild(this.title);
    this.root.appendChild(this.description);
    this.root.appendChild(this.numberDisplay);
  }

  setPlayerName(name: string): void {
    this.title.textContent = `${name} 님, 준비되었소?`;
  }

  setCountdownValue(value: number): void {
    this.numberDisplay.textContent = value > 0 ? String(value) : "START!";
  }
}
