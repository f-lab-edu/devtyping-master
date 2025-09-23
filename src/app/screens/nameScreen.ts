import { BaseScreen } from "./baseScreen";

interface NameScreenCallbacks {
  onSubmit(name: string): void;
}

export class NameScreen extends BaseScreen {
  private readonly form: HTMLFormElement;
  private readonly input: HTMLInputElement;
  private callbacks: NameScreenCallbacks | null = null;

  constructor() {
    super("main-card", "screen");

    const header = document.createElement("div");
    const title = document.createElement("h1");
    title.textContent = "DevTyping Week 1";
    const description = document.createElement("p");
    description.textContent = "플레이어 이름을 입력하고 60초 타이핑 레이스를 시작하시오.";

    header.appendChild(title);
    header.appendChild(description);

    this.form = document.createElement("form");
    this.form.id = "name-form";

    const label = document.createElement("label");
    label.setAttribute("for", "playerName");
    label.textContent = "플레이어 이름";

    this.input = document.createElement("input");
    this.input.id = "playerName";
    this.input.name = "playerName";
    this.input.type = "text";
    this.input.required = true;
    this.input.placeholder = "예: 코딩라이언";

    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "게임 시작";

    this.form.appendChild(label);
    this.form.appendChild(this.input);
    this.form.appendChild(button);

    this.root.appendChild(header);
    this.root.appendChild(this.form);

    this.form.addEventListener("submit", event => {
      event.preventDefault();
      const value = this.input.value.trim();
      if (!value) {
        this.focus();
        return;
      }
      this.callbacks?.onSubmit(value);
    });
  }

  setCallbacks(callbacks: NameScreenCallbacks): void {
    this.callbacks = callbacks;
  }

  setInitialName(value: string): void {
    this.input.value = value;
  }

  reset(): void {
    this.input.value = "";
  }

  focus(): void {
    window.requestAnimationFrame(() => this.input.focus());
  }
}
