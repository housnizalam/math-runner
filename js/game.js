"use strict";

// =========================//
//           Imports        //
// =========================//
import { generateQuestion, generateLimits } from "./questions.js";

import {
  POINTS_PER_LEVEL,
  MAX_LEVEL,
  getLevelSettings,
  saveUnlockedLevel,
  getHighestUnlockedLevel,
} from "./levels.js";

import { GAME_MODES, MODE_STATE } from "./gameModes.js";

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

// =========================//
//       Game Constants     //
// =========================//

const FAST_FORWARD_MULTIPLIER = 7;
const FORCE_EXIT_MULTIPLIER = 10;
const START_ROW_Y = -100;

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

  noGateSelected: false,

  professionalMode: false,

  gateRows: [],
};

// =========================//
//      Game Functions      //
// =========================//

/*
==================================================
FUNCTION INDEX
==================================================

updatePlayerPosition()   → Moves player to selected lane
handleKeyboard()         → Handles keyboard controls
handleKeyUp()            → Ends fast-forward on key release
initGame()               → Initializes game and events

startRound()             → Creates a new question and gate row
evaluateAnswer()         → Checks player's answer
moveGateRows()           → Moves all active gate rows
gameLoop()               → Main animation loop

hasRowReachedPlayer()    → Detects gate/player meeting
finishRound()            → Updates score, lives and next round
checkGateRows()          → Finds rows ready for evaluation
removeExitedRows()       → Removes rows outside the road

togglePause()            → Switches play/pause modes
stopGame()               → Returns game to START mode
restartGame()            → Restarts current level

changeLevel()            → Changes selected unlocked level
updateLevelButtons()     → Enables/disables level arrows

updateHUD()              → Updates Score / Level / Lives
updateGameModeUI()       → Updates UI for current mode
setGameMode()            → Changes and applies game mode
clearGateRows()          → Removes all existing gate rows
createGateRow()          → Builds one dynamic gate row
updateSelectedOperations → Updates selected operations
handleOperationChange()  → Handles operation checkbox changes
handleSelectAllOperations() → Handles select all operations checkbox
updateOperationControls() → Enables/disables operation checkboxes
==================================================
*/

function updatePlayerPosition() {
  const roadWidth = road.clientWidth;

  const sidePadding = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--road-side-padding",
    ),
  );

  const innerWidth = roadWidth - sidePadding * 2;

  const laneWidth = innerWidth / 3;

  const centerOfLane =
    sidePadding + gameState.playerLane * laneWidth + laneWidth / 2;

  player.style.left = `${centerOfLane}px`;
}

function handleKeyboard(event) {
  // Play / Pause
  // Enter
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

    stopGame();

    return;
  }

  // L key pressed
  if (event.code === "KeyL") {
    gameState.isLevelKeyPressed = true;
    return;
  }

  // Change level only in START
  if (
    gameState.mode === GAME_MODES.START &&
    gameState.isLevelKeyPressed
  ) {
    if (event.key === "ArrowUp") {
      event.preventDefault();

      changeLevel(1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      changeLevel(-1);
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
    }
  }

  if (event.key === "ArrowRight") {
    if (gameState.playerLane < 2) {
      gameState.playerLane++;
      updatePlayerPosition();
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
}

function startRound() {
  gameState.noGateSelected = false;

  const levelSettings = getLevelSettings(gameState.level);

  gameState.speed = levelSettings.speed;

  const question = generateQuestion(
    levelSettings.minNumber,
    levelSettings.maxNumber,
    gameState.selectedOperations,
  );

  const limitsData = generateLimits(question.result);

  questionElement.textContent = `${question.number1} ${question.operator} ${question.number2} = ?`;

  const rowElement = createGateRow(limitsData.limits);

  rowElement.style.transform = `translateY(${START_ROW_Y}px)`;

  gameState.gateRows.push({
    element: rowElement,
    y: START_ROW_Y,
    evaluated: false,
    correctGate: limitsData.correctGate,
    forceExit: false,
  });
}

function evaluateAnswer(row) {
  const isCorrect = gameState.noGateSelected
    ? row.correctGate === null
    : gameState.playerLane === row.correctGate;

  console.log(
    "Player selected:",
    gameState.noGateSelected ? "NO GATE" : `Gate ${gameState.playerLane + 1}`,
  );

  console.log(
    "Correct answer:",
    row.correctGate === null ? "NO GATE" : `Gate ${row.correctGate + 1}`,
  );

  console.log(isCorrect ? "CORRECT" : "WRONG");

  return isCorrect;
}

function moveGateRows() {
  const currentSpeed = gameState.isFastForward
    ? gameState.speed * FAST_FORWARD_MULTIPLIER
    : gameState.speed;

  gameState.gateRows.forEach((row) => {
    const rowSpeed = row.forceExit
      ? gameState.speed * FORCE_EXIT_MULTIPLIER
      : currentSpeed;

    row.y += rowSpeed;

    row.element.style.transform = `translateY(${row.y}px)`;
  });
}

function gameLoop() {
  if (gameState.mode !== GAME_MODES.PLAYING) {
    return;
  }

  moveGateRows();

  checkGateRows();

  removeExitedRows();

  requestAnimationFrame(gameLoop);
}

function hasRowReachedPlayer(row) {
  const gate = row.element.querySelector(".gate");

  const gateRect = gate.getBoundingClientRect();

  const playerRect = player.getBoundingClientRect();

  return gateRect.top >= playerRect.top;
}

function togglePause() {
  if (gameState.mode === GAME_MODES.START) {
    setGameMode(GAME_MODES.PLAYING);

    requestAnimationFrame(gameLoop);

    return;
  }

  if (gameState.mode === GAME_MODES.PLAYING) {
    setGameMode(GAME_MODES.PAUSED);

    return;
  }

  if (gameState.mode === GAME_MODES.PAUSED) {
    setGameMode(GAME_MODES.PLAYING);

    requestAnimationFrame(gameLoop);
  }
}

function updateHUD() {
  scoreElement.textContent = `Score: ${gameState.score}`;

  levelNumberElement.textContent = gameState.level;

  livesElement.textContent = `Lives: ${gameState.lives}`;
}

function createGateRow(limits) {
  const row = document.createElement("div");

  row.classList.add("gate-row");

  // LIMITS

  const limitsContainer = document.createElement("div");

  limitsContainer.classList.add("limits");

  limits.forEach((limit, index) => {
    const limitElement = document.createElement("div");

    limitElement.classList.add("limit-box", `limit-${index}`);

    limitElement.textContent = limit;

    limitsContainer.append(limitElement);
  });

  // GATES

  const gatesContainer = document.createElement("div");

  gatesContainer.classList.add("gates");

  for (let i = 0; i < 3; i++) {
    const gate = document.createElement("div");

    gate.classList.add("gate");

    gate.dataset.lane = i;

    gate.textContent = "GATE";

    gatesContainer.append(gate);
  }

  // BUILD ROW

  row.append(limitsContainer, gatesContainer);

  gateRowsContainer.append(row);

  return row;
}

function finishRound(row) {
  gameState.isFastForward = false;
  gameState.canFastForward = false;

  const isCorrect = evaluateAnswer(row);

  if (isCorrect) {
    gameState.score += 1;

    if (gameState.score >= POINTS_PER_LEVEL) {
      gameState.score = 0;

      if (gameState.level < MAX_LEVEL) {
        gameState.level += 1;

        gameState.lives += 1;

        saveUnlockedLevel(gameState.level);
      }
    }
  } else {
    gameState.lives--;
  }

  updateHUD();

  if (gameState.lives <= 0) {
    gameOver();

    return;
  }

  startRound();
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
  const roadRect = road.getBoundingClientRect();

  gameState.gateRows = gameState.gateRows.filter((row) => {
    const rowRect = row.element.getBoundingClientRect();

    if (rowRect.top >= roadRect.bottom) {
      row.element.remove();
      //   console.log("Removed exited row");

      //   console.log("Rows:", gameState.gateRows.length);

      return false;
    }

    return true;
  });
}

function gameOver() {
  finalLevelElement.textContent = gameState.level;

  setGameMode(GAME_MODES.GAME_OVER);
}

function restartGame() {
  clearGateRows();

  setGameMode(GAME_MODES.START);

  startRound();
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
}

function updateSelectedOperations() {
  const selectedOperations = [];

  operationCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedOperations.push(checkbox.value);
    }
  });

  if (selectedOperations.length === 0) {
    return;
  }

  gameState.selectedOperations = selectedOperations;
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
}
