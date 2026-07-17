import assert from "assert/strict";
import { promiseAll2 } from "../src/promise-all2";

const delay = (ms: number, label: string) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log(label);
      resolve(label);
    }, ms),
  );
};

const errDelay = (ms: number, label: string) => {
  return new Promise((_, reject) =>
    setTimeout(() => {
      reject(new Error(label + " failed"));
    }, ms),
  );
};

async function testResolves(
  label: string,
  fn: Function,
  expectedResult: unknown[],
) {
  try {
    const results = await fn();
    assert.deepStrictEqual(results, expectedResult);
    console.log(`✓ ${label}`);
  } catch (err) {
    if (err instanceof Error) {
      console.log(`✗ ${label}: ${err.message}`);
      throw err;
    }
  }
}

async function testRejects(label: string, fn: Function, expectedError: Error) {
  try {
    await fn();
    console.log(`✗ ${label}: expected rejection but resolved`);
  } catch (err) {
    if (err instanceof Error) {
      assert.deepStrictEqual(err, expectedError);
      console.log(`✓ ${label}: ${err.message}`);
    }
  }
}

async function runTests() {
  await testResolves(
    "handles empty task array",
    async () => promiseAll2([]),
    [],
  );

  await testResolves(
    "preserves original order",
    async () =>
      promiseAll2([
        delay(1000, "A"),
        delay(500, "B"),
        delay(800, "C"),
        delay(300, "D"),
        delay(600, "E"),
      ]),
    ["A", "B", "C", "D", "E"],
  );

  await testRejects(
    "rejects on task failure",
    async () =>
      promiseAll2([
        delay(1000, "A"),
        delay(500, "B"),
        delay(800, "C"),
        delay(1200, "D"),
        errDelay(300, "E"),
        delay(6000, "F"),
      ]),
    Error("E failed"),
  );
}

runTests();
