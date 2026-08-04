import assert from "assert/strict";
import { throttle } from "../src/throttle";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let timesCalled = 0;
let base = 1;

function multiply(this: { factor: number }) {
  base *= this.factor;
  timesCalled++;
}

const mult = {
  factor: 2,
  throttledMultiply: throttle(multiply, 100),
};

async function runTests() {
  mult.throttledMultiply();
  await wait(50);
  mult.throttledMultiply();
  assert.deepStrictEqual(timesCalled, 0);
  assert.deepStrictEqual(base, 1);
  await wait(50);
  mult.throttledMultiply();
  assert.deepStrictEqual(timesCalled, 1);
  assert.deepStrictEqual(base, 2);
  await wait(50);
  assert.deepStrictEqual(timesCalled, 1);
  assert.deepStrictEqual(base, 2);
}

runTests();
