"use strict";

export const OPERATIONS = {
  ADDITION: "addition",
  SUBTRACTION: "subtraction",
  MULTIPLICATION: "multiplication",
  DIVISION: "division",
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(
  minNumber,
  maxNumber,
  selectedOperations = [OPERATIONS.ADDITION],
) {
  const operationIndex = getRandomNumber(0, selectedOperations.length - 1);

  const operation = selectedOperations[operationIndex];

  let number1 = getRandomNumber(minNumber, maxNumber);
  let number2 = getRandomNumber(minNumber, maxNumber);

  if (operation === OPERATIONS.DIVISION) {
    if (number1 < number2) {
      const temp = number1;
      number1 = number2;
      number2 = temp;
    }
    if (number1 / 2 < number2) {
      number2 = Math.round(number2 / getRandomNumber(1, 10));
    }
    if (number2 === 0) {
      number2 = 1;
    }
  }

  let result;
  let operator;

  switch (operation) {
    case OPERATIONS.ADDITION:
      result = number1 + number2;
      operator = "+";
      break;

    case OPERATIONS.SUBTRACTION:
      result = number1 - number2;
      operator = "−";
      break;

    case OPERATIONS.MULTIPLICATION:
      result = number1 * number2;
      operator = "×";
      break;

    case OPERATIONS.DIVISION:
      result = number1 / number2;
      operator = "÷";
      break;

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return {
    number1,
    number2,
    result,
    operator,
    operation,
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
      limit0 = result - getRandomNumber(1, 15);

      limit1 = result + getRandomNumber(1, 15);

      limit2 = limit1 + getRandomNumber(1, 30);

      limit3 = limit2 + getRandomNumber(1, 30);

      break;

    case 1:
      limit1 = result - getRandomNumber(1, 15);

      limit2 = result + getRandomNumber(1, 15);

      limit0 = limit1 - getRandomNumber(1, 30);

      limit3 = limit2 + getRandomNumber(1, 30);

      break;

    case 2:
      limit2 = result - getRandomNumber(1, 15);

      limit3 = result + getRandomNumber(1, 15);

      limit1 = limit2 - getRandomNumber(1, 30);

      limit0 = limit1 - getRandomNumber(1, 30);

      break;

    case 3:
      const side = getRandomNumber(0, 1);

      if (side === 0) {
        limit0 = result + getRandomNumber(1, 15);

        limit1 = limit0 + getRandomNumber(1, 30);

        limit2 = limit1 + getRandomNumber(1, 30);

        limit3 = limit2 + getRandomNumber(1, 30);
      } else {
        limit3 = result - getRandomNumber(1, 15);

        limit2 = limit3 - getRandomNumber(1, 30);

        limit1 = limit2 - getRandomNumber(1, 30);

        limit0 = limit1 - getRandomNumber(1, 30);
      }

      break;
  }

  return {
    limits: [
      Math.round(limit0),
      Math.round(limit1),
      Math.round(limit2),
      Math.round(limit3),
    ],

    correctGate: correctGateCase === 3 ? null : correctGateCase,
  };
}


export function generateLimitExpression(limit, selectedOperations) {
  const operationIndex = getRandomNumber(0, selectedOperations.length - 1);

  const operation = selectedOperations[operationIndex];

  switch (operation) {
    case OPERATIONS.ADDITION: {
      const range = Math.max(10, Math.abs(limit) * 2);

      let number1 = getRandomNumber(-range, range);
      let number2 = limit - number1;

      if (number2 < 0) {
        const temp = number1;
        number1 = number2;
        number2 = temp;
      }

      return `${number1} + ${number2}`;
    }

    case OPERATIONS.SUBTRACTION: {
      const range = Math.max(10, Math.abs(limit) * 2);

      const number2 = getRandomNumber(1, range);
      const number1 = limit + number2;

      return `${number1} − ${number2}`;
    }

    case OPERATIONS.MULTIPLICATION: {
      if (limit === 0) {
        const number1 = getRandomNumber(-20, 20);

        return `${number1} × 0`;
      }

      const divisors = [];

      const absoluteLimit = Math.abs(limit);

      for (let i = 1; i <= absoluteLimit; i++) {
        if (absoluteLimit % i === 0) {
          divisors.push(i);
        }
      }

      let number1 = divisors[getRandomNumber(0, divisors.length - 1)];

      // Randomly make number1 negative
      if (getRandomNumber(0, 1) === 1) {
        number1 *= -1;
      }

      const number2 = limit / number1;

      return `${number1} × ${number2}`;
    }

    case OPERATIONS.DIVISION: {
      let divisor = getRandomNumber(2, 10);

      if (getRandomNumber(0, 1) === 1) {
        divisor *= -1;
      }

      const dividend = limit * divisor;

      return `${dividend} ÷ ${divisor}`;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}