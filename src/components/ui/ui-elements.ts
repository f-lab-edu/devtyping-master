export function createStatBlock(labelText: string, valueText: string): HTMLDivElement {
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

export function createCard(): HTMLDivElement {
  const card = document.createElement("div");
  card.className = "main-card screen";
  return card;
}

export function createButton(text: string, onClick?: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = text;
  if (onClick) {
    button.addEventListener("click", onClick);
  }
  return button;
}

export function createInput(placeholder: string, type: string = "text"): HTMLInputElement {
  const input = document.createElement("input");
  input.type = type;
  input.placeholder = placeholder;
  return input;
}

export function createResultRow(labelText: string, valueText: string): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "result-row";

  const label = document.createElement("span");
  label.textContent = labelText;

  const value = document.createElement("span");
  value.textContent = valueText;

  row.appendChild(label);
  row.appendChild(value);
  return row;
}
