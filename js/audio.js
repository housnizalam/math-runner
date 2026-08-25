"use strict";

/* =========================================================
   AUDIO FILES
   ========================================================= */

const sounds = {
  correct: new Audio("../assets/sounds/correct.mp3"),
  wrong: new Audio("../assets/sounds/wrong.mp3"),
  levelUp: new Audio("../assets/sounds/level-up.mp3"),
  gameOver: new Audio("../assets/sounds/game-over.mp3"),
  start: new Audio("../assets/sounds/start.mp3"),
  buttonClick: new Audio("../assets/sounds/button-click.mp3"),
};


/* =========================================================
   AUDIO SETTINGS
   ========================================================= */

let soundVolume = 0.7;
let isMuted = false;


/* =========================================================
   INTERNAL AUDIO FUNCTION
   ========================================================= */

function playSound(sound) {
  if (isMuted) {
    return;
  }

  sound.volume = soundVolume;

  // Restart the sound if it is triggered again before finishing
  sound.currentTime = 0;

  sound.play();
}


/* =========================================================
   GAME SOUND FUNCTIONS
   ========================================================= */

export function playCorrectSound() {
  playSound(sounds.correct);
}

export function playWrongSound() {
  playSound(sounds.wrong);
}

export function playLevelUpSound() {
  playSound(sounds.levelUp);
}

export function playGameOverSound() {
  playSound(sounds.gameOver);
}

export function playStartSound() {
  playSound(sounds.start);
}

export function playButtonClickSound() {
  playSound(sounds.buttonClick);
}


/* =========================================================
   AUDIO CONTROLS
   ========================================================= */

export function setSoundVolume(volume) {
  soundVolume = Math.max(0, Math.min(1, volume));
}

export function setMuted(muted) {
  isMuted = muted;
}