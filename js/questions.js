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

function formatNumber(number) {
  return number < 0 ? `(${number})` : `${number}`;
}

function getNextDivisibleNumber(number, divisor) {
  while (number % divisor !== 0) {
    number++;
  }

  return number;
}

function isPrime(number) {
  const absoluteNumber = Math.abs(number);

  if (absoluteNumber < 2 || !Number.isInteger(absoluteNumber)) {
    return false;
  }

  for (let i = 2; i <= Math.sqrt(absoluteNumber); i++) {
    if (absoluteNumber % i === 0) {
      return false;
    }
  }

  return true;
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

export function generateProfessionalQuestion(
  minNumber,
  maxNumber,
  selectedOperations = [OPERATIONS.ADDITION],
) {
  const question = generateQuestion(minNumber, maxNumber, selectedOperations);

  if (
    question.operation === OPERATIONS.DIVISION &&
    !Number.isInteger(question.result)
  ) {
    question.number1 = getNextDivisibleNumber(
      question.number1,
      question.number2,
    );

    question.result = question.number1 / question.number2;
  }

  return question;
}

function generateOptionValues(result, selectedOperations) {
  const onlyMultiplication =
    selectedOperations.length === 1 &&
    selectedOperations[0] === OPERATIONS.MULTIPLICATION;

  const cannotUseMultiplicationResult =
    isPrime(result) || Math.abs(result) <= 1;

  const correctGateCase =
    onlyMultiplication && cannotUseMultiplicationResult
      ? 3
      : getRandomNumber(0, 3);

  const optionValues = [];

  for (let i = 0; i < 3; i++) {
    if (i === correctGateCase) {
      optionValues.push(result);
      continue;
    }

    let wrongValue;

    do {
      wrongValue = result + getRandomNumber(-20, 20);
    } while (
      wrongValue === result ||
      optionValues.includes(wrongValue) ||
      (onlyMultiplication && (isPrime(wrongValue) || Math.abs(wrongValue) <= 1))
    );

    optionValues.push(wrongValue);
  }

  return {
    optionValues,
    correctGate: correctGateCase === 3 ? null : correctGateCase,
  };
}

export function generateProfessionalOptions(result, selectedOperations) {
  const { optionValues, correctGate } = generateOptionValues(
    result,
    selectedOperations,
  );

  const options = optionValues.map((value) =>
    generateExpressionForValue(value, selectedOperations),
  );

  return {
    options,
    correctGate,
  };
}

function generateExpressionForValue(value, selectedOperations) {
  let availableOperations = [...selectedOperations];

  const cannotUseMultiplication = isPrime(value) || Math.abs(value) <= 1;

  if (
    cannotUseMultiplication &&
    availableOperations.includes(OPERATIONS.MULTIPLICATION) &&
    availableOperations.length > 1
  ) {
    availableOperations = availableOperations.filter(
      (operation) => operation !== OPERATIONS.MULTIPLICATION,
    );
  }

  const operationIndex = getRandomNumber(0, availableOperations.length - 1);

  const operation = availableOperations[operationIndex];

  switch (operation) {
    case OPERATIONS.ADDITION: {
      const range = Math.max(10, Math.abs(value) * 2);

      let number1 = getRandomNumber(-range, range);
      let number2 = value - number1;

      if (number2 < 0) {
        const temp = number1;
        number1 = number2;
        number2 = temp;
      }

      return `${number1} + ${number2}`;
    }

    case OPERATIONS.SUBTRACTION: {
      const range = Math.max(10, Math.abs(value) * 2);

      const number2 = getRandomNumber(1, range);
      const number1 = value + number2;

      return `${number1} − ${number2}`;
    }

    case OPERATIONS.MULTIPLICATION: {
      if (value === 0) {
        const number1 = getRandomNumber(-20, 20);

        return `${number1} × 0`;
      }

      const divisors = [];

      const absoluteValue = Math.abs(value);

      for (let i = 1; i <= absoluteValue; i++) {
        if (absoluteValue % i === 0) {
          divisors.push(i);
        }
      }

      if (divisors.length === 0) {
        throw new Error(
          `No valid multiplication expression for value: ${value}`,
        );
      }

      let number1 = divisors[getRandomNumber(0, divisors.length - 1)];

      // Randomly make number1 negative
      if (getRandomNumber(0, 1) === 1) {
        number1 *= -1;
      }

      const number2 = value / number1;

      return `${number1} × ${number2}`;
    }

    case OPERATIONS.DIVISION: {
      let divisor = getRandomNumber(2, 10);

      if (getRandomNumber(0, 1) === 1) {
        divisor *= -1;
      }

      const dividend = value * divisor;

      return `${dividend} ÷ ${divisor}`;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

export function generateEasyOptions(result, selectedOperations) {
  const { optionValues, correctGate } = generateOptionValues(
    result,
    selectedOperations,
  );

  return {
    options: optionValues,
    correctGate,
  };
}