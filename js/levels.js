"use strict";


export const POINTS_PER_LEVEL = 5;

export const MAX_LEVEL = 21;


const NUMBER_RANGES = [
    10,
    20,
    50,
    100,
    200,
    500,
    1000
];


export function getLevelSettings(level) {

    const rangeIndex =
        (level - 1) % NUMBER_RANGES.length;

    const speed =
        Math.floor(
            (level - 1) / NUMBER_RANGES.length
        ) + 1;

    const maxNumber =
        NUMBER_RANGES[rangeIndex];

    return {
        speed,
        minNumber: 1,
        maxNumber
    };
}


// =========================
// SAVE PROGRESS
// =========================

export function saveUnlockedLevel(level) {
  const savedLevel = Number(localStorage.getItem("highestUnlockedLevel")) || 1;

  if (level > savedLevel) {
    localStorage.setItem("highestUnlockedLevel", level);
  }
}

// =========================
// LOAD PROGRESS
// =========================

export function getHighestUnlockedLevel() {
  return Number(localStorage.getItem("highestUnlockedLevel")) || 1;
}
