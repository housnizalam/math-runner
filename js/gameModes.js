"use strict";


export const GAME_MODES = {
    START: "start",
    PLAYING: "playing",
    PAUSED: "paused",
    GAME_OVER: "gameOver"
};


export const MODE_STATE = {

    [GAME_MODES.START]: {
        score: 0,
        lives: 3,
        playerLane: 1,

        isFastForward: false,
        canFastForward: true,

        noGateSelected: false
    },


    [GAME_MODES.PLAYING]: {

    },


    [GAME_MODES.PAUSED]: {
        isFastForward: false
    },


    [GAME_MODES.GAME_OVER]: {
        isFastForward: false,
        canFastForward: false,
        noGateSelected: false
    }
};