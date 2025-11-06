import { gameTimer } from "../../core/game";
import { stateManager } from "../../core/state";
import type { Difficulty } from "../../types";

import { createCard, createButton, createInput } from "../ui";

export function renderNameScreen(container: HTMLElement): void {
  container.innerHTML = "";

  const card = createCard();

  const header = document.createElement("div");
  const title = document.createElement("h1");
  title.textContent = "DevTyping Master";

  const description = document.createElement("p");
  description.textContent = "플레이어 이름을 입력하고 60초 타이핑 레이스를 시작하세요.";

  header.appendChild(title);
  header.appendChild(description);

  const form = document.createElement("form");
  form.id = "name-form";

  const label = document.createElement("label");
  label.setAttribute("for", "playerName");
  label.textContent = "플레이어 이름";

  const input = createInput("예: 호두누나!");
  input.required = true;

  // 난이도 선택 UI
  const difficultySection = document.createElement("div");
  difficultySection.classList = "difficulty-section";

  const difficultyLabel = document.createElement("label");
  difficultyLabel.textContent = "난이도";

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "button-group";

  const difficulties: Array<{ value: Difficulty; label: string }> = [
    { value: "easy", label: "쉬움" },
    { value: "normal", label: "보통" },
    { value: "hard", label: "어려움" },
  ];

  difficulties.forEach(({ value, label }) => {
    const btn = createButton(label);
    btn.className = value === "normal" ? "difficulty-btn active" : "difficulty-btn";
    btn.type = "button";
    btn.setAttribute("data-difficulty", value);
    btn.addEventListener("click", () => {
      buttonGroup.querySelectorAll(".difficulty-btn").forEach(b => {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      stateManager.setDifficulty(value);
    });
    buttonGroup.appendChild(btn);
  });

  difficultySection.appendChild(difficultyLabel);
  difficultySection.appendChild(buttonGroup);

  const button = createButton("게임 시작");
  button.type = "submit";

  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(difficultySection);
  form.appendChild(button);

  card.appendChild(header);
  card.appendChild(form);
  container.appendChild(card);

  form.addEventListener("submit", (event: Event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
      input.focus();
      return;
    }
    button.disabled = true;
    stateManager.setPlayerName(value);
    gameTimer.startCountdown();
  });

  window.requestAnimationFrame(() => input.focus());
}
