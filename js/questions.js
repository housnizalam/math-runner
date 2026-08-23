"use strict";


function getRandomNumber(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


export function generateQuestion(
    minNumber,
    maxNumber
) {

    const number1 =
        getRandomNumber(
            minNumber,
            maxNumber
        );

    const number2 =
        getRandomNumber(
            minNumber,
            maxNumber
        );

    const result =
        number1 + number2;

    return {
        number1,
        number2,
        result
    };
}

export function generateLimits(result) {

    const correctGateCase = getRandomNumber(0, 3);

    let limit0;
    let limit1;
    let limit2;
    let limit3;


    switch (correctGateCase) {

        case 0:

            limit0 =
                result - getRandomNumber(1, 15);

            limit1 =
                result + getRandomNumber(1, 15);

            limit2 =
                limit1 + getRandomNumber(1, 30);

            limit3 =
                limit2 + getRandomNumber(1, 30);

            break;


        case 1:

            limit1 =
                result - getRandomNumber(1, 15);

            limit2 =
                result + getRandomNumber(1, 15);

            limit0 =
                limit1 - getRandomNumber(1, 30);

            limit3 =
                limit2 + getRandomNumber(1, 30);

            break;


        case 2:

            limit2 =
                result - getRandomNumber(1, 15);

            limit3 =
                result + getRandomNumber(1, 15);

            limit1 =
                limit2 - getRandomNumber(1, 30);

            limit0 =
                limit1 - getRandomNumber(1, 30);

            break;


        case 3:

            const side =
                getRandomNumber(0, 1);

            if (side === 0) {

                limit0 =
                    result + getRandomNumber(1, 15);

                limit1 =
                    limit0 + getRandomNumber(1, 30);

                limit2 =
                    limit1 + getRandomNumber(1, 30);

                limit3 =
                    limit2 + getRandomNumber(1, 30);
            }

            else {

                limit3 =
                    result - getRandomNumber(1, 15);

                limit2 =
                    limit3 - getRandomNumber(1, 30);

                limit1 =
                    limit2 - getRandomNumber(1, 30);

                limit0 =
                    limit1 - getRandomNumber(1, 30);
            }

            break;
    }


    return {
        limits: [
            limit0,
            limit1,
            limit2,
            limit3
        ],

        correctGate:
            correctGateCase === 3
                ? null
                : correctGateCase
    };
}