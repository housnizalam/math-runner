"use strict";

import {
    generateQuestion,
    generateLimits
} from "../questions.js";


function testQuestionSystem(rounds = 10) {

    for (let i = 1; i <= rounds; i++) {

        const question = generateQuestion();
        const limitsData = generateLimits(question.result);

        const limits = limitsData.limits;

        console.log(`===== ROUND ${i} =====`);

        console.log(
            `Question: ${question.number1} + ${question.number2} = ${question.result}`
        );

        console.log(
            `Limits: ${limits.join(" | ")}`
        );

        console.log(
            `Gate 1: ${limits[0]} → ${limits[1]}`
        );

        console.log(
            `Gate 2: ${limits[1]} → ${limits[2]}`
        );

        console.log(
            `Gate 3: ${limits[2]} → ${limits[3]}`
        );

        console.log(
            "Correct answer:",
            limitsData.correctGate === null
                ? "NO GATE → Enter"
                : `Gate ${limitsData.correctGate + 1}`
        );

        console.log("");
    }
}


testQuestionSystem(10);