"use strict";

import { OPERATIONS } from "./questions.js";

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateLimitExpression(limit, selectedOperations) {
  const operationIndex = getRandomNumber(0, selectedOperations.length - 1);

  const operation = selectedOperations[operationIndex];

  switch (operation) {
    case OPERATIONS.ADDITION: {
      const number1 = Math.round(
        limit / getRandomNumber(1, 3) -
          getRandomNumber(getRandomNumber(1, 3), limit),
      );
      const number2 = limit - number1;

      return `${number1} + ${number2}`;
    }

    case OPERATIONS.SUBTRACTION: {
      const number2 = getRandomNumber(1, 20);
      const number1 = limit + number2;

      return `${number1} − ${number2}`;
    }

    case OPERATIONS.MULTIPLICATION: {
      const absoluteLimit = Math.abs(limit);

      const divisors = [];

      for (let divisor = 2; divisor <= absoluteLimit; divisor++) {
        if (absoluteLimit % divisor === 0) {
          divisors.push(divisor);
        }
      }

      if (divisors.length > 0 && absoluteLimit > 1) {
        const divisor = divisors[getRandomNumber(0, divisors.length - 1)];

        let number1 = divisor;
        let number2 = absoluteLimit / divisor;

        if (limit < 0) {
          number1 *= -1;
        }

        return `${number1} × ${number2}`;
      }

      // Prime numbers / 0 / 1
      return `${limit} × 1`;
    }

    case OPERATIONS.DIVISION: {
      const divisor = getRandomNumber(2, 10);
      const dividend = limit * divisor;

      return `${dividend} ÷ ${divisor}`;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}
