// copied game_controller.js (no logic changes) - moved to public/assets/js

import {
  WORDS,
  generateSequence,
  parseUserInput,
  checkAnswer,
  difficultyPresets
} from "./game_core.js";
import { saveRound, loadSettings, saveSettings } from "./storage.js";
import { playSound } from "./sound.js";
import { t } from "./i18n.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class GameController {
  constructor(opts = {}) {
    this.callbacks = {
      onRoundSaved: opts.onRoundSaved || null,
    };

    const stored = loadSettings() || {};
    this.settings = {
      difficulty: stored.difficulty || "1",
      seed: stored.seed ?? null,
      sounds: stored.sounds ?? false,
    };

    this.displayEl = document.getElementById("display-item");
    this.displaySub = document.getElementById("display-sub");
    this.answerStage = document.getElementById("answer-stage");
    this.answerInput = document.getElementById("answer-input");
    this.startBtn = document.getElementById("start-btn");
    this.submitBtn = document.getElementById("submit-btn");
    this.roundInfo = document.getElementById("round-info");
    this.roundTime = document.getElementById("round-time");
    this.levelName = document.getElementById("level-name");
    this.difficultyRow = document.getElementById("difficulty-row");

    this.state = "idle";
    this.sequence = [];
    this.key = [];
    this.tickId = null;
    this.startTime = null;

    this._bindDifficultyButtons();
    this._wireInputs();
    this._applyDifficulty(this.settings.difficulty);
  }

  _bindDifficultyButtons() {
    if (!this.difficultyRow) return;
    const levels = [
      { id: "1", label: "Easy", i18n: "difficulty_easy" },
      { id: "2", label: "Medium", i18n: "difficulty_medium" },
      { id: "3", label: "Hard", i18n: "difficulty_hard" },
      { id: "4", label: "Very Hard", i18n: "difficulty_very_hard" },
    ];
    this.difficultyRow.innerHTML = "";
    levels.forEach((lvl) => {
      const btn = document.createElement("button");
      btn.className = "btn secondary level-btn";
      btn.dataset.level = lvl.id;
      btn.textContent = lvl.label;
      btn.setAttribute('data-i18n', lvl.i18n);
      btn.addEventListener("click", () => {
        this._setDifficulty(lvl.id);
      });
      this.difficultyRow.appendChild(btn);
    });
    this._updateDifficultyButtons();
  }

  _setDifficulty(id) {
    this.settings.difficulty = String(id);
    this._applyDifficulty(this.settings.difficulty);
    saveSettings(this.settings);
    this._updateDifficultyButtons();
  }

  _updateDifficultyButtons() {
    if (!this.difficultyRow) return;
    const buttons = this.difficultyRow.querySelectorAll(".level-btn");
    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.level === String(this.settings.difficulty));
    });
  }

  _applyDifficulty(name) {
    const all = typeof difficultyPresets === "function" ? difficultyPresets() : difficultyPresets;
    const preset = all[String(name)] || all["1"];
    this.preset = preset;
    this.wordIntervalMs = (preset.wordInterval || 2) * 1000;

    const labelMap = {
      "1": t("difficulty_easy"),
      "2": t("difficulty_medium"),
      "3": t("difficulty_hard"),
      "4": t("difficulty_very_hard"),
    };
    if (this.levelName) this.levelName.textContent = labelMap[String(name)] || "Custom";
  }

  _wireInputs() {
    if (this.startBtn) {
      this.startBtn.addEventListener("click", () => this.startRound());
    }
    if (this.submitBtn) {
      this.submitBtn.addEventListener("click", () => this.submitAnswer());
    }

    if (this.answerInput) {
      this.answerInput.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          // Submit the answer when Enter is pressed
          if (this.state === "answering") {
            this.submitAnswer();
          }
        }
      });

      this.answerInput.addEventListener("input", () => {
        this._updateSubmitState();
      });
    }
  }

  _pushCurrentToken() {
    const raw = this.answerInput.value.trim();
    if (!raw) return;
    this.answerTokens.push(raw);
    this.answerInput.value = "";
    this._renderChips();
    this._updateSubmitState();
  }

  _renderChips() {
    if (!this.answerChips) return;
    this.answerChips.innerHTML = "";
    this.answerTokens.forEach((tok, i) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = tok;
      chip.addEventListener("click", () => {
        this.answerTokens.splice(i, 1);
        this._renderChips();
        this._updateSubmitState();
      });
      this.answerChips.appendChild(chip);
    });
  }

  _updateSubmitState() {
    const hasInput = this.answerInput.value.trim().length > 0;
    this.submitBtn.disabled = !hasInput;
  }

  async startRound() {
    if (this.state !== "idle" && this.state !== "review") return;
    this._applyDifficulty(this.settings.difficulty);

    const { min, max, wordInterval } = this.preset;
    const { sequence, key } = generateSequence({
      min,
      max,
      wordInterval,
      words: WORDS,
      seed: this.settings.seed,
    });

    this.sequence = sequence;
    this.key = key;
    this.state = "showing";

    this._updateSubmitState();
    this.answerStage.classList.add("hidden");
    this.submitBtn.disabled = true;
    this.startBtn.disabled = true;
    this.answerInput.value = "";
    this.roundInfo.textContent = `${t('label_items')}: ${this.sequence.length}`;
    this.displaySub.textContent = t('display_memorize');
    this.displayEl.textContent = "—";

    for (const item of this.sequence) {
      this.displayEl.textContent = item;
      this.displayEl.classList.add("flash");
      playSound('show_item'); // Sound feedback for each item
      await sleep(this.wordIntervalMs * 0.75);
      this.displayEl.classList.remove("flash");
      this.displayEl.textContent = "•";
      await sleep(this.wordIntervalMs * 0.25);
    }

    this._switchToAnswerMode();
  }

  _switchToAnswerMode() {
    this.state = "answering";
    this.displayEl.textContent = "—";
    this.displaySub.textContent = t('display_type_items');
    this.answerStage.classList.remove("hidden");
    this.submitBtn.disabled = true;
    this.startBtn.disabled = true;
    this._startTimer();
  }

  _startTimer() {
    this.startTime = performance.now();
    if (this.tickId) clearInterval(this.tickId);
    this.tickId = setInterval(() => {
      const elapsed = (performance.now() - this.startTime) / 1000;
      this.roundTime.textContent = `${t('label_time')}: ${elapsed.toFixed(2)}s`;
    }, 100);
  }

  _stopTimer() {
    if (this.tickId) clearInterval(this.tickId);
    const elapsed = (performance.now() - this.startTime) / 1000;
    this.tickId = null;
    this.startTime = null;
    this.roundTime.textContent = `Time: ${elapsed.toFixed(2)}s`;
    return elapsed;
  }

  submitAnswer() {
    if (this.state !== "answering") return;

    // Get answer from input field (comma-separated values)
    const inputText = this.answerInput.value.trim();
    const user = parseUserInput(inputText);
    const result = checkAnswer(this.key, user);
    const elapsed = this._stopTimer();

    const round = {
      ts: new Date().toISOString(),
      difficulty: this.settings.difficulty,
      sequence: this.sequence,
      key: this.key,
      answer: user,
      result: {
        correct: result.correct,
        errors: result.errors,
        details: result.details,
        elapsed,
      },
    };

    saveRound(round);

    this.state = "review";
    this.submitBtn.disabled = true;
    this.startBtn.disabled = false;
    this.roundInfo.textContent = `${t('label_errors')}: ${result.errors}`;
    this._showResultModal(round);

    return round;
  }

  _showResultModal(round) {
    const { errors, details, elapsed } = round.result;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const box = document.createElement("div");
    box.className = "modal-box card";

    const title = document.createElement("h3");
    const total = details.length;
    const correctCount = total - errors;
    const accuracy = Math.round((correctCount / total) * 100);

    // Play sound based on result
    if (errors === 0) {
      playSound('correct');
    } else {
      playSound('wrong');
    }

    title.textContent =
      errors === 0 ? t('result_flawless') : accuracy >= 70 ? t('result_close') : t('result_training');

    const summary = document.createElement("p");
    summary.className = "muted small";
    summary.textContent = `${t('label_accuracy')}: ${accuracy}% • ${t('label_time')}: ${elapsed.toFixed(2)}s`;

    const list = document.createElement("ul");
    list.className = "result-list";

    details.forEach(([u, c, ok], i) => {
      const li = document.createElement("li");
      li.className = `result-item ${ok ? "ok" : "fail"}`;
      li.textContent = `${t('result_position')} ${i + 1}: ${t('result_expected')} ${c} — ${t('result_you')} ${u === undefined ? "[—]" : u}`;
      list.appendChild(li);
    });

    const actions = document.createElement("div");
    actions.className = "modal-actions";

    const again = document.createElement("button");
    again.className = "btn primary";
    again.textContent = t('btn_try_again');
    again.onclick = () => {
      overlay.remove();
      this.startRound();
    };

    const diff = document.createElement("button");
    diff.className = "btn secondary";
    diff.textContent = t('btn_change_difficulty');
    diff.onclick = () => {
      overlay.remove();
      this.answerStage.classList.add("hidden");
      this.startBtn.disabled = false;
    };

    const menu = document.createElement("button");
    menu.className = "btn ghost";
    menu.textContent = t('btn_menu');
    menu.onclick = () => {
      window.location.href = "./index.html";
    };

    actions.append(again, diff, menu);
    box.append(title, summary, list, actions);
    overlay.append(box);
    document.body.append(overlay);
  }
}

export default GameController;
