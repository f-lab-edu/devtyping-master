import { CLEAR_SCORE, COUNTDOWN_START } from "./constants";
import { GameEngine } from "./game/engine";
import { GameResult, View } from "./state/types";
import { CountdownScreen } from "./screens/countdownScreen";
import { GameScreen } from "./screens/gameScreen";
import { NameScreen } from "./screens/nameScreen";
import { ResultScreen } from "./screens/resultScreen";

export class App {
  private readonly root: HTMLElement;
  private readonly nameScreen: NameScreen;
  private readonly countdownScreen: CountdownScreen;
  private readonly gameScreen: GameScreen;
  private readonly resultScreen: ResultScreen;
  private readonly gameEngine: GameEngine;

  private view: View = "name";
  private playerName = "";
  private countdownValue = COUNTDOWN_START;
  private countdownTimerId: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;

    this.nameScreen = new NameScreen();
    this.countdownScreen = new CountdownScreen();
    this.gameScreen = new GameScreen();
    this.resultScreen = new ResultScreen();

    this.nameScreen.mount(this.root);
    this.countdownScreen.mount(this.root);
    this.gameScreen.mount(this.root);
    this.resultScreen.mount(this.root);

    this.gameEngine = new GameEngine(this.gameScreen, {
      onTimerChange: seconds => this.gameScreen.setTimer(seconds),
      onScoreChange: score => this.gameScreen.setScore(score),
      onAccuracyChange: percentage => this.gameScreen.setAccuracy(percentage),
      onFinish: result => this.handleGameFinish(result)
    });

    this.nameScreen.setCallbacks({
      onSubmit: name => {
        this.playerName = name;
        this.startCountdown();
      }
    });

    this.gameScreen.setCallbacks({
      onSubmit: value => {
        this.gameEngine.submitWord(value);
        this.gameScreen.clearInput();
        this.gameScreen.focusInput();
      },
      onSkip: () => {
        this.gameEngine.skipWord();
        this.gameScreen.clearInput();
        this.gameScreen.focusInput();
      }
    });

    this.resultScreen.setCallbacks({
      onRetry: () => {
        this.startCountdown();
      },
      onRename: () => {
        this.playerName = "";
        this.gameEngine.stop();
        this.stopCountdown();
        this.nameScreen.reset();
        this.switchView("name");
        this.nameScreen.focus();
      }
    });
  }

  start(): void {
    this.switchView("name");
    this.nameScreen.reset();
    this.nameScreen.focus();
  }

  private startCountdown(): void {
    this.gameEngine.stop();
    this.stopCountdown();

    this.countdownValue = COUNTDOWN_START;
    this.countdownScreen.setPlayerName(this.playerName);
    this.countdownScreen.setCountdownValue(this.countdownValue);
    this.switchView("countdown");

    this.countdownTimerId = window.setInterval(() => {
      this.countdownValue -= 1;
      if (this.countdownValue >= 0) {
        this.countdownScreen.setCountdownValue(this.countdownValue);
      }

      if (this.countdownValue < 0) {
        this.stopCountdown();
        this.startGame();
      }
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownTimerId !== null) {
      window.clearInterval(this.countdownTimerId);
      this.countdownTimerId = null;
    }
  }

  private startGame(): void {
    this.gameScreen.reset(this.playerName);
    this.switchView("game");
    this.gameScreen.focusInput();
    this.gameEngine.start();
  }

  private handleGameFinish(result: GameResult): void {
    this.switchView("result");
    this.resultScreen.showResult(this.playerName, result, CLEAR_SCORE);
  }

  private switchView(next: View): void {
    this.view = next;
    this.nameScreen.hide();
    this.countdownScreen.hide();
    this.gameScreen.hide();
    this.resultScreen.hide();

    if (next === "name") {
      this.nameScreen.show();
    } else if (next === "countdown") {
      this.countdownScreen.show();
    } else if (next === "game") {
      this.gameScreen.show();
    } else if (next === "result") {
      this.resultScreen.show();
    }
  }
}
