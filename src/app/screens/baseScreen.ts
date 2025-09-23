export abstract class BaseScreen {
  protected readonly root: HTMLDivElement;

  protected constructor(...classNames: string[]) {
    this.root = document.createElement("div");
    if (classNames.length > 0) {
      this.root.className = classNames.join(" ");
    }
    this.root.hidden = true;
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.root);
  }

  show(): void {
    this.root.hidden = false;
  }

  hide(): void {
    this.root.hidden = true;
  }

  get element(): HTMLDivElement {
    return this.root;
  }
}
