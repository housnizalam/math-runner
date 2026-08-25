"use strict";

import { OPERATIONS } from "../questions.js";
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

// {
//  // ADDITION test
//   const selectedOperations = [
//     OPERATIONS.ADDITION,
//   ];

//   const testLimits = [
//     10,
//     20,
//     50,
//     100,
//     500,
//     1000,
//     -10,
//     -100,
//   ];

//   testLimits.forEach((limit) => {
//     const expression = generateLimitExpression(
//       limit,
//       selectedOperations,
//     );

//     console.log(
//       `Limit: ${limit} → ${expression}`,
//     );
//   });
// }

// {
//  // SUBTRACTION test
//   const selectedOperations = [
//     OPERATIONS.SUBTRACTION,
//   ];

//   const testLimits = [
//     10,
//     20,
//     50,
//     100,
//     500,
//     1000,
//     -10,
//     -100,
//   ];

//   testLimits.forEach((limit) => {
//     const expression = generateLimitExpression(
//       limit,
//       selectedOperations,
//     );

//     console.log(
//       `Limit: ${limit} → ${expression}`,
//     );
//   });
// }

// {
//  // MULTIPLICATION test
//   const selectedOperations = [
//     OPERATIONS.MULTIPLICATION,
//   ];

//   const testLimits = [
//     10,
//     20,
//     50,
//     100,
//     500,
//     1000,
//     -10,
//     -100,
//   ];

//   testLimits.forEach((limit) => {
//     const expression = generateLimitExpression(
//       limit,
//       selectedOperations,
//     );

//     console.log(
//       `Limit: ${limit} → ${expression}`,
//     );
//   });
// }

// {
//   // MULTIPLICATION Prime test
//   const selectedOperations = [OPERATIONS.MULTIPLICATION];

//   const testLimits = [7, 11, 19, 23, 149, 997, -7, -11, -19, -23, -149, -997];

//   testLimits.forEach((limit) => {
//     const expression = generateLimitExpression(limit, selectedOperations);

//     console.log(`Limit: ${limit} → ${expression}`);
//   });
// }

// {
//   // MULTIPLICATION zero test
//   const selectedOperations = [OPERATIONS.MULTIPLICATION];

//   const testLimits = [0, 0, 0, 0, 0, 0];

//   testLimits.forEach((limit) => {
//     const expression = generateLimitExpression(limit, selectedOperations);

//     console.log(`Limit: ${limit} → ${expression}`);
//   });
// }

// {
//  // DIVISION test
//   const selectedOperations = [
//     OPERATIONS.DIVISION,
//   ];

//   const testLimits = [
//     10,
//     20,
//     50,
//     100,
//     500,
//     1000,
//     -10,
//     -100,
//   ];

//   testLimits.forEach((limit) => {
//     const expression = generateLimitExpression(
//       limit,
//       selectedOperations,
//     );

//     console.log(
//       `Limit: ${limit} → ${expression}`,
//     );
//   });
// }

// {
//   // DIVISION Prime test
//   const selectedOperations = [OPERATIONS.DIVISION];

//   const testLimits = [7, 11, 19, 23, 149, 997, -7, -11, -19, -23, -149, -997];

//   testLimits.forEach((limit) => {
//     const expression = generateLimitExpression(limit, selectedOperations);

//     console.log(`Limit: ${limit} → ${expression}`);
//   });
// }

// {
//   // DIVISION zero test
//   const selectedOperations = [OPERATIONS.DIVISION];

//   const testLimits = [0,0,0,0,0,0];

//   testLimits.forEach((limit) => {
//     const expression = generateLimitExpression(limit, selectedOperations);

//     console.log(`Limit: ${limit} → ${expression}`);
//   });
// }


// {
//  // Multi Operation test
//   const selectedOperations = [
//     OPERATIONS.ADDITION,
//     OPERATIONS.SUBTRACTION,
//     OPERATIONS.MULTIPLICATION,
//     OPERATIONS.DIVISION
//   ];

//   const testLimits = [
//     10,
//     20,
//     50,
//     100,
//     500,
//     1000,
//     -10,
//     -100,
//   ];

//   testLimits.forEach((limit) => {
//     const expression = generateLimitExpression(
//       limit,
//       selectedOperations,
//     );

//     console.log(
//       `Limit: ${limit} → ${expression}`,
//     );
//   });
// }