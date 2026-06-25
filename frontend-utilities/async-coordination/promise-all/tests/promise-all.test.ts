import assert from "assert/strict";
import { promiseAll } from "../src/promise-all";

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
    }
  }
}

async function testRejects(label: string, fn: Function) {
  try {
    await fn();
    console.log(`✗ ${label}: expected rejection but resolved`);
  } catch (err) {
    if (err instanceof Error) {
      console.log(`✓ ${label}: ${err.message}`);
    }
  }
}

async function runTests() {
  await testResolves(
    "handles empty task array",
    async () => promiseAll([]),
    [],
  );

  await testResolves(
    "preserves original order",
    async () =>
      promiseAll([
        delay(1000, "A"),
        delay(500, "B"),
        delay(800, "C"),
        delay(300, "D"),
        delay(600, "E"),
      ]),
    ["A", "B", "C", "D", "E"],
  );

  await testRejects("rejects on task failure", async () =>
    promiseAll([
      delay(1000, "A"),
      delay(500, "B"),
      delay(800, "C"),
      delay(1200, "D"),
      errDelay(300, "E"),
      delay(6000, "F"),
    ]),
  );
}

runTests();
