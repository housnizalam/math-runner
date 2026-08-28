"use strict";

// =========================//
//           Imports        //
// =========================//
import {
  generateQuestion,
  generateProfessionalQuestion,
  generateLimits,
  generateEasyOptions,
  generateProfessionalOptions,
} from "./questions.js";

import {
  POINTS_PER_LEVEL,
  MAX_LEVEL,
  getLevelSettings,
  saveUnlockedLevel,
  getHighestUnlockedLevel,
} from "./levels.js";

import { GAME_MODES, MODE_STATE } from "./gameModes.js";

import {
  playCorrectSound,
  playWrongSound,
  playLevelUpSound,
  playGameOverSound,
  playStartSound,
  playButtonClickSound,
  setMuted,
} from "./audio.js";
// =========================//
//       Game Elements      //
// =========================//

const player = document.querySelector("#player");

const scoreElement = document.querySelector("#score");

const livesElement = document.querySelector("#lives");

const questionElement = document.querySelector("#question");

const pauseButton = document.querySelector("#pause-button");

const pauseOverlay = document.querySelector("#pause-overlay");

const gateRowsContainer = document.querySelector("#gate-rows");

const gameOverScreen = document.querySelector("#game-over");

const finalLevelElement = document.querySelector("#final-level");

const restartButton = document.querySelector("#restart-button");

const levelNumberElement = document.querySelector("#level-number");

const levelUpButton = document.querySelector("#level-up");

const levelDownButton = document.querySelector("#level-down");

const road = document.querySelector("#road");

const stopButton = document.querySelector("#stop-button");

const operationCheckboxes = document.querySelectorAll(".operation-checkbox");

const selectAllOperations = document.querySelector("#select-all-operations");

const startOverlay = document.querySelector("#start-overlay");

const startPlayButton = document.querySelector("#start-play-button");

const answerModeRadios = document.querySelectorAll('input[name="answer-mode"]');

const levelUpOverlay = document.querySelector("#level-up-overlay");

const levelUpText = document.querySelector("#level-up-text");

const professionalLimitsContainer = document.querySelector(
  "#professional-limits",
);

const playerImage = document.querySelector(".player-image");

const muteButton = document.querySelector("#mute-button");

const soundOnIcon = document.querySelector("#sound-on-icon");

const soundOffIcon = document.querySelector("#sound-off-icon");

// =========================//
//       Game Constants     //
// =========================//

const FAST_FORWARD_MULTIPLIER = 12;
const FORCE_EXIT_MULTIPLIER = 12;
const GATE_PROGRESS_SPEED = 0.002;
const PLAYER_LANE_SPREAD = 1.1;
const ROUND_TRANSITION_DELAY = 200;
let isMuted = false;

const ANSWER_MODES = {
  LIMIT: "limit",
  EASY: "easy",
  PRO: "pro",
};

const gameState = {
  mode: GAME_MODES.START,

  score: 0,
  lives: 3,
  level: 1,

  playerLane: 1,
  speed: 1,

  selectedOperations: ["addition"],

  isFastForward: false,
  canFastForward: true,

  isLevelKeyPressed: false,

  isLevelUpActive: false,

  noGateSelected: false,

  answerMode: ANSWER_MODES.LIMIT,

  gateRows: [],
};

const isMobile = window.matchMedia("(max-width: 600px)").matches;

const PERSPECTIVE_CONFIG = {
  startTop: isMobile ? 100 : -10,

  playerTop: isMobile ? 500 : 520,

  exitTop: 760,

  startWidthRatio: isMobile ? 0.15 : 0.16,

  endWidthRatio: isMobile ? 0.85 : 1.4,

  startScale: isMobile ? 0.5 : 0.45,

  endScale: isMobile ? 1.15 : 1.1,

  triggerProgress: isMobile ? 1.2 : 1.0,

  exitProgress: 1.35,
};

// =========================//
//      Game Functions      //
// =========================//

/*
==================================================
FUNCTION INDEX
==================================================

updatePlayerPosition()          → Moves player to selected lane
handleKeyboard()                → Handles keyboard controls
handleKeyUp()                   → Handles key releases
initGame()                      → Initializes game and events
bindEvents()                    → Registers event listeners

startRound()                    → Creates a new question and gate row
evaluateAnswer()                → Checks player's answer
moveGateRows()                  → Moves active gate rows
gameLoop()                      → Main animation loop
hasRowReachedPlayer()           → Detects gate/player meeting
finishRound()                   → Updates score/lives and starts next round
checkGateRows()                 → Finds rows ready for evaluation
removeExitedRows()              → Removes rows outside the road

togglePause()                   → Switches Start / Playing / Paused
stopGame()                      → Returns game to START mode
gameOver()                      → Activates GAME OVER mode
restartGame()                   → Restarts the game

changeLevel()                   → Changes selected unlocked level
updateLevelButtons()            → Enables/disables level arrows

updateHUD()                     → Updates Score / Level / Lives
updateGameModeUI()              → Updates UI for current mode
setGameMode()                   → Changes and applies game mode
clearGateRows()                 → Removes all existing gate rows
createGateRow()                 → Builds one dynamic gate row

handleOperationChange()         → Handles operation checkbox changes
handleSelectAllOperations()     → Handles Select All checkbox
updateOperationControls()       → Enables/disables operation controls

showAnswerFeedback()            → Shows correct/wrong feedback
showLevelUpEffect()             → Shows level-up animation
showGameOverEffect()            → Shows game-over animation

lerp()                          → Linear interpolation helper
updateGateRowPerspective()      → Updates gate-row perspective

tiltPlayer()                    → Adds temporary movement tilt
updatePlayerLaneTilt()          → Updates permanent lane tilt
toggleMute()                    → Toggles game audio
==================================================
*/

function updatePlayerPosition() {
  const roadWidth = road.clientWidth;

  const sidePadding = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--road-side-padding",
    ),
  );

  const innerWidth = roadWidth - sidePadding * 2;
  const laneWidth = innerWidth / 3;

  const laneOffset =
    (gameState.playerLane - 1) * laneWidth * PLAYER_LANE_SPREAD;

  player.style.transform = `translateX(calc(-50% + ${laneOffset}px))`;
}

function handleKeyboard(event) {
  // Play / Pause
  // Enter

  if (event.code === "KeyM") {
    toggleMute();
    return;
  }
  if (event.code === "Enter") {
    event.preventDefault();

    if (gameState.mode === GAME_MODES.GAME_OVER) {
      restartGame();
      return;
    }

    togglePause();
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    playButtonClickSound();
    stopGame();
    return;
  }

  // L key pressed
  if (event.code === "KeyL") {
    gameState.isLevelKeyPressed = true;
    levelUpButton.classList.add("keyboard-hover");
    levelDownButton.classList.add("keyboard-hover");
    return;
  }

  // Change level only in START
  if (gameState.mode === GAME_MODES.START && gameState.isLevelKeyPressed) {
    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!levelUpButton.disabled) {
        showLevelButtonPress(levelUpButton);
        playButtonClickSound();
        changeLevel(1);
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!levelDownButton.disabled) {
        showLevelButtonPress(levelDownButton);
        playButtonClickSound();
        changeLevel(-1);
      }

      return;
    }
  }

  // Game controls work only while playing
  if (gameState.mode !== GAME_MODES.PLAYING) {
    return;
  }

  if (event.key === "ArrowLeft") {
    if (gameState.playerLane > 0) {
      gameState.playerLane--;
      updatePlayerPosition();
      updatePlayerLaneTilt();
      tiltPlayer("left");
      playButtonClickSound();
    }
  }

  if (event.key === "ArrowRight") {
    if (gameState.playerLane < 2) {
      gameState.playerLane++;
      updatePlayerPosition();
      updatePlayerLaneTilt();
      tiltPlayer("right");
      playButtonClickSound();
    }
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();

    if (gameState.canFastForward) {
      gameState.isFastForward = true;
    }

    return;
  }

  if (event.code === "Space") {
    event.preventDefault();

    gameState.noGateSelected = true;

    const activeRow = gameState.gateRows.find((row) => !row.evaluated);

    if (activeRow) {
      activeRow.forceExit = true;
    }

    return;
  }
}

function handleKeyUp(event) {
  if (event.key === "ArrowDown") {
    gameState.isFastForward = false;
    gameState.canFastForward = true;
  }

  if (event.code === "KeyL") {
    gameState.isLevelKeyPressed = false;
    levelUpButton.classList.remove("keyboard-hover");
    levelDownButton.classList.remove("keyboard-hover");
  }
}

export function initGame() {
  bindEvents();

  setGameMode(GAME_MODES.START);

  startRound();
}

function bindEvents() {
  document.addEventListener("keydown", handleKeyboard);

  document.addEventListener("keyup", handleKeyUp);

  pauseButton.addEventListener("click", togglePause);

  muteButton.addEventListener("click", toggleMute);

  restartButton.addEventListener("click", restartGame);

  levelUpButton.addEventListener("click", function () {
    changeLevel(1);
  });

  levelDownButton.addEventListener("click", function () {
    changeLevel(-1);
  });

  stopButton.addEventListener("click", stopGame);

  operationCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", handleOperationChange);
  });

  selectAllOperations.addEventListener("change", handleSelectAllOperations);

  startPlayButton.addEventListener("click", togglePause);

  answerModeRadios.forEach((radio) => {
    radio.addEventListener("change", handleAnswerModeChange);
  });
}

function handleAnswerModeChange(event) {
  gameState.answerMode = event.target.value;

  clearGateRows();
  startRound();
}

function startRound() {
  gameState.noGateSelected = false;

  const levelSettings = getLevelSettings(gameState.level);

  gameState.speed = levelSettings.speed;

  const usesDirectGateAnswers =
    gameState.answerMode === ANSWER_MODES.EASY ||
    gameState.answerMode === ANSWER_MODES.PRO;

  const question = usesDirectGateAnswers
    ? generateProfessionalQuestion(
        levelSettings.minNumber,
        levelSettings.maxNumber,
        gameState.selectedOperations,
      )
    : generateQuestion(
        levelSettings.minNumber,
        levelSettings.maxNumber,
        gameState.selectedOperations,
      );

  let roundData;

  if (gameState.answerMode === ANSWER_MODES.PRO) {
    roundData = generateProfessionalOptions(
      question.result,
      gameState.selectedOperations,
    );
  } else if (gameState.answerMode === ANSWER_MODES.EASY) {
    roundData = generateEasyOptions(
      question.result,
      gameState.selectedOperations,
    );
  } else {
    roundData = generateLimits(question.result);
  }

  questionElement.textContent = `${question.number1} ${question.operator} ${question.number2} = ?`;

  const rowElement = createGateRow(roundData);

  const rowData = {
    element: rowElement,
    progress: 0,
    evaluated: false,
    correctGate: roundData.correctGate,
    forceExit: false,
  };

  gameState.gateRows.push(rowData);

  updateGateRowPerspective(rowData);
}

function evaluateAnswer(row) {
  const isCorrect = gameState.noGateSelected
    ? row.correctGate === null
    : gameState.playerLane === row.correctGate;

  return isCorrect;
}

function moveGateRows() {
  const baseSpeed = gameState.isFastForward
    ? gameState.speed * FAST_FORWARD_MULTIPLIER
    : gameState.speed;

  gameState.gateRows.forEach((row) => {
    let rowSpeed = baseSpeed;

    if (row.forceExit || row.evaluated) {
      rowSpeed = gameState.speed * FORCE_EXIT_MULTIPLIER;
    }

    row.progress += rowSpeed * GATE_PROGRESS_SPEED;

    updateGateRowPerspective(row);
  });
}

function gameLoop() {
  if (gameState.mode !== GAME_MODES.PLAYING) {
    return;
  }

  if (!gameState.isLevelUpActive) {
    moveGateRows();
    checkGateRows();
    removeExitedRows();
  }

  requestAnimationFrame(gameLoop);
}

function hasRowReachedPlayer(row) {
  const gate = row.element.querySelector(".gate-image");

  const gateRect = gate.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();

  const gateCenterY =
    gateRect.top + gateRect.height / 2 + playerRect.height / 2;

  return gateCenterY >= playerRect.top;
}

function togglePause() {
  if (gameState.mode === GAME_MODES.START) {
    setGameMode(GAME_MODES.PLAYING);
    playStartSound();

    requestAnimationFrame(gameLoop);

    return;
  }

  if (gameState.mode === GAME_MODES.PLAYING) {
    setGameMode(GAME_MODES.PAUSED);

    return;
  }

  if (gameState.mode === GAME_MODES.PAUSED) {
    setGameMode(GAME_MODES.PLAYING);
    playStartSound();

    requestAnimationFrame(gameLoop);
  }
}

function updateHUD() {
  scoreElement.textContent = gameState.score;

  levelNumberElement.textContent = gameState.level;

  livesElement.textContent = gameState.lives;
}

function createGateRow(roundData) {
  const row = document.createElement("div");
  row.classList.add("gate-row");

  // =========================
  // LIMIT MODE
  // =========================

  if (gameState.answerMode === ANSWER_MODES.LIMIT) {
    const limitsContainer = document.createElement("div");

    limitsContainer.classList.add("limits");

    roundData.limits.forEach((limit, index) => {
      const limitElement = document.createElement("div");

      limitElement.classList.add("limit-box", `limit-${index}`);

      limitElement.textContent = limit;

      limitsContainer.append(limitElement);
    });

    row.append(limitsContainer);
  }

  // =========================
  // GATES
  // =========================

  const gatesContainer = document.createElement("div");

  gatesContainer.classList.add("gates");

  for (let i = 0; i < 3; i++) {
    const gate = document.createElement("div");

    gate.classList.add("gate");

    const gateImage = document.createElement("img");

    gateImage.classList.add("gate-image");
    gateImage.src = "./assets/images/gate.png";
    gateImage.alt = `Gate ${i + 1}`;

    gate.append(gateImage);

    // EASY + PRO
    if (gameState.answerMode !== ANSWER_MODES.LIMIT) {
      const optionElement = document.createElement("div");

      optionElement.classList.add("professional-gate-option");

      optionElement.textContent = roundData.options[i];

      gate.append(optionElement);
    }

    gatesContainer.append(gate);
  }

  row.append(gatesContainer);

  gateRowsContainer.append(row);

  return row;
}

function finishRound(row) {
  gameState.isFastForward = false;
  gameState.canFastForward = false;

  const isCorrect = evaluateAnswer(row);
  showAnswerFeedback(isCorrect);

  if (isCorrect) {
    gameState.score += 1;
    playCorrectSound();

    if (gameState.score >= POINTS_PER_LEVEL) {
      gameState.score = 0;

      if (gameState.level < MAX_LEVEL) {
        gameState.level += 1;

        gameState.lives += 1;

        saveUnlockedLevel(gameState.level);

        showLevelUpEffect(gameState.level);
        playLevelUpSound();
      }
    }
  } else {
    gameState.lives--;
    if (gameState.lives >= 0) {
      playWrongSound();
    }
  }

  updateHUD();

  if (gameState.lives <= 0) {
    gameOver();

    return;
  }

  setTimeout(() => {
    startRound();
  }, ROUND_TRANSITION_DELAY);
}

function checkGateRows() {
  gameState.gateRows.forEach((row) => {
    if (!row.evaluated && hasRowReachedPlayer(row)) {
      row.evaluated = true;
      finishRound(row);
    }
  });
}

function removeExitedRows() {
  gameState.gateRows = gameState.gateRows.filter((row) => {
    if (row.progress >= PERSPECTIVE_CONFIG.exitProgress) {
      row.element.remove();
      return false;
    }

    return true;
  });
}

function gameOver() {
  finalLevelElement.textContent = gameState.level;

  setGameMode(GAME_MODES.GAME_OVER);
  showGameOverEffect();
  playGameOverSound();
}

function restartGame() {
  clearGateRows();

  setGameMode(GAME_MODES.START);

  startRound();
  updatePlayerLaneTilt();
}

function updateLevelButtons() {
  const highestUnlockedLevel = getHighestUnlockedLevel();

  const canChangeLevel = gameState.mode === GAME_MODES.START;

  // DOWN
  levelDownButton.disabled = !canChangeLevel || gameState.level <= 1;

  // UP
  levelUpButton.disabled =
    !canChangeLevel || gameState.level >= highestUnlockedLevel;
}

function changeLevel(direction) {
  if (gameState.mode !== GAME_MODES.START) {
    return;
  }

  const highestUnlockedLevel = getHighestUnlockedLevel();

  const newLevel = gameState.level + direction;

  if (newLevel < 1 || newLevel > highestUnlockedLevel) {
    return;
  }

  gameState.level = newLevel;

  clearGateRows();

  setGameMode(GAME_MODES.START);

  startRound();
}

function updateGameModeUI() {
  questionElement.style.visibility = "visible";

  document
    .querySelectorAll(".limits, .professional-gate-option")
    .forEach((element) => {
      element.style.visibility = "visible";
    });

  switch (gameState.mode) {
    case GAME_MODES.START:
      startOverlay.classList.remove("hidden");

      pauseOverlay.classList.add("hidden");
      gameOverScreen.classList.add("hidden");

      pauseButton.textContent = "▶";
      pauseButton.setAttribute("aria-label", "Play");

      stopButton.disabled = true;

      break;

    case GAME_MODES.PLAYING:
      startOverlay.classList.add("hidden");

      pauseOverlay.classList.add("hidden");
      gameOverScreen.classList.add("hidden");

      pauseButton.textContent = "⏸";
      pauseButton.setAttribute("aria-label", "Pause");

      stopButton.disabled = false;

      break;

    case GAME_MODES.PAUSED:
      pauseButton.textContent = "▶";
      pauseButton.setAttribute("aria-label", "Resume");

      pauseOverlay.classList.remove("hidden");
      gameOverScreen.classList.add("hidden");

      stopButton.disabled = false;
      startOverlay.classList.add("hidden");

      questionElement.style.visibility = "hidden";

      document
        .querySelectorAll(".limits, .professional-gate-option")
        .forEach((element) => {
          element.style.visibility = "hidden";
        });

      break;

    case GAME_MODES.GAME_OVER:
      pauseButton.textContent = "▶";
      pauseButton.setAttribute("aria-label", "Play");

      pauseOverlay.classList.add("hidden");
      gameOverScreen.classList.remove("hidden");

      stopButton.disabled = true;
      startOverlay.classList.add("hidden");

      break;
  }
}

function setGameMode(mode) {
  gameState.mode = mode;

  const modeState = MODE_STATE[mode];

  Object.assign(gameState, modeState);

  updateGameModeUI();

  updateHUD();

  updatePlayerPosition();

  updateLevelButtons();

  updateOperationControls();
}

function clearGateRows() {
  gameState.gateRows.forEach((row) => {
    row.element.remove();
  });

  gameState.gateRows = [];
}

function stopGame() {
  if (gameState.mode === GAME_MODES.START) {
    return;
  }

  clearGateRows();

  setGameMode(GAME_MODES.START);

  startRound();

  updatePlayerLaneTilt();
}

function handleOperationChange(event) {
  const checkedOperations = [...operationCheckboxes].filter(
    (checkbox) => checkbox.checked,
  );

  if (checkedOperations.length === 0) {
    event.target.checked = true;
    return;
  }

  gameState.selectedOperations = checkedOperations.map(
    (checkbox) => checkbox.value,
  );

  selectAllOperations.checked =
    checkedOperations.length === operationCheckboxes.length;
  clearGateRows();
  startRound();
}

function handleSelectAllOperations() {
  const shouldSelectAll = selectAllOperations.checked;

  operationCheckboxes.forEach((checkbox) => {
    checkbox.checked = shouldSelectAll;
  });

  if (!shouldSelectAll) {
    operationCheckboxes[0].checked = true;
  }

  gameState.selectedOperations = [...operationCheckboxes]
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  clearGateRows();
  startRound();
}

function updateOperationControls() {
  const canChangeOperations = gameState.mode === GAME_MODES.START;

  operationCheckboxes.forEach((checkbox) => {
    checkbox.disabled = !canChangeOperations;
  });

  selectAllOperations.disabled = !canChangeOperations;

  answerModeRadios.forEach((radio) => {
    radio.disabled = !canChangeOperations;
  });
}

function showAnswerFeedback(isCorrect) {
  const className = isCorrect ? "feedback-correct" : "feedback-wrong";

  player.classList.remove("feedback-correct", "feedback-wrong");

  // Restart animation if feedback happens again quickly
  void player.offsetWidth;

  player.classList.add(className);

  player.addEventListener(
    "animationend",
    () => {
      player.classList.remove(className);
    },
    { once: true },
  );
}

function showLevelUpEffect(level) {
  gameState.isLevelUpActive = true;

  levelUpText.textContent = `LEVEL ${level}`;

  levelUpOverlay.classList.remove("hidden", "level-up-active");

  void levelUpOverlay.offsetWidth;

  levelUpOverlay.classList.add("level-up-active");

  levelUpOverlay.addEventListener(
    "animationend",
    () => {
      levelUpOverlay.classList.remove("level-up-active");

      levelUpOverlay.classList.add("hidden");

      gameState.isLevelUpActive = false;
    },
    { once: true },
  );
}

function showGameOverEffect() {
  gameOverScreen.classList.remove("game-over-active");

  void gameOverScreen.offsetWidth;

  gameOverScreen.classList.add("game-over-active");

  gameOverScreen.addEventListener(
    "animationend",
    (event) => {
      if (event.target !== gameOverScreen) {
        return;
      }

      gameOverScreen.classList.remove("game-over-active");
    },
    { once: true },
  );
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function updateGateRowPerspective(row) {
  const roadWidth = road.clientWidth;

  const clampedProgress = Math.min(
    row.progress,
    PERSPECTIVE_CONFIG.triggerProgress,
  );

  const progressRatio = clampedProgress / PERSPECTIVE_CONFIG.triggerProgress;

  let optionStartSize = 1;
  let optionEndSize = 4;
  const limitFontSize = isMobile ? lerp(0.7, 1.5, progressRatio) : 2.7;

  if (isMobile && gameState.answerMode === ANSWER_MODES.EASY) {
    optionStartSize = 0.8;
    optionEndSize = 2;
  }

  if (isMobile && gameState.answerMode === ANSWER_MODES.PRO) {
    optionStartSize = 0.2;
    optionEndSize = 1.7;
  }

  const professionalOptionFontSize = lerp(
    optionStartSize,
    optionEndSize,
    progressRatio,
  );
  // =========================
  // VERTICAL POSITION
  // =========================

  const normalTop = lerp(
    PERSPECTIVE_CONFIG.startTop,
    PERSPECTIVE_CONFIG.playerTop,
    progressRatio,
  );

  let currentTop = normalTop;

  // After evaluation, continue moving down until exit
  if (row.progress > PERSPECTIVE_CONFIG.triggerProgress) {
    const extraProgress =
      (row.progress - PERSPECTIVE_CONFIG.triggerProgress) /
      (PERSPECTIVE_CONFIG.exitProgress - PERSPECTIVE_CONFIG.triggerProgress);

    currentTop = lerp(
      PERSPECTIVE_CONFIG.playerTop,
      PERSPECTIVE_CONFIG.exitTop,
      Math.min(extraProgress, 1),
    );
  }

  row.element.style.top = `${currentTop}px`;

  // =========================
  // PERSPECTIVE WIDTH
  // =========================

  const width = lerp(
    roadWidth * PERSPECTIVE_CONFIG.startWidthRatio,
    roadWidth * PERSPECTIVE_CONFIG.endWidthRatio,
    progressRatio,
  );

  // =========================
  // PERSPECTIVE SCALE
  // =========================

  const scale = lerp(
    PERSPECTIVE_CONFIG.startScale,
    PERSPECTIVE_CONFIG.endScale,
    progressRatio,
  );

  // =========================
  // APPLY STYLES
  // =========================

  row.element.style.setProperty("--row-scale", scale);

  row.element.style.setProperty(
    "--professional-option-font-size",
    `${professionalOptionFontSize}rem`,
  );
  row.element.style.setProperty("--limit-font-size", `${limitFontSize}rem`);

  row.element.style.left = "50%";
  row.element.style.width = `${width}px`;

  row.element.style.transform = `translateX(-50%) scale(${scale})`;
}

function tiltPlayer(direction) {
  playerImage.classList.remove("tilt-left", "tilt-right");

  if (direction === "right" && gameState.playerLane < 2) {
    playerImage.classList.add("tilt-left");
  }

  if (direction === "left" && gameState.playerLane > 0) {
    playerImage.classList.add("tilt-right");
  }

  setTimeout(() => {
    playerImage.classList.remove("tilt-left", "tilt-right");
  }, 220);
}
function updatePlayerLaneTilt() {
  playerImage.classList.remove("lane-left", "lane-center", "lane-right");

  if (gameState.playerLane === 0) {
    playerImage.classList.add("lane-left");
  } else if (gameState.playerLane === 1) {
    playerImage.classList.add("lane-center");
  } else if (gameState.playerLane === 2) {
    playerImage.classList.add("lane-right");
  }
}

function toggleMute() {
  isMuted = !isMuted;

  setMuted(isMuted);

  soundOnIcon.classList.toggle("hidden", isMuted);
  soundOffIcon.classList.toggle("hidden", !isMuted);
}

function showLevelButtonPress(button) {
  button.classList.remove("keyboard-press");

  void button.offsetWidth;

  button.classList.add("keyboard-press");

  setTimeout(() => {
    button.classList.remove("keyboard-press");
  }, 120);
}
