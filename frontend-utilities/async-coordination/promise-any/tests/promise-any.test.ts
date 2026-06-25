import assert from "assert/strict";
import { promiseAny } from "../src/promise-any";

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
  expectedResult: string,
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

async function testRejects(
  label: string,
  fn: Function,
  expectedError: AggregateError["errors"],
) {
  try {
    await fn();
    console.log(`✗ ${label}: expected rejection but resolved`);
  } catch (err) {
    if (err instanceof AggregateError) {
      console.log(`✓ ${label}: ${err.message}`);
      assert.deepStrictEqual(err.errors, expectedError);
    }
  }
}

async function runTests() {
  await testRejects("handles empty task array", async () => promiseAny([]), []);

  await testResolves(
    "resolved on any",
    async () =>
      promiseAny([
        delay(1000, "A"),
        delay(500, "B"),
        delay(800, "C"),
        delay(300, "D"),
        delay(600, "E"),
      ]),
    "D",
  );

  await testRejects(
    "rejects on all failures and preserves order",
    async () =>
      promiseAny([
        errDelay(1000, "A"),
        errDelay(500, "B"),
        errDelay(800, "C"),
        errDelay(1200, "D"),
        errDelay(300, "E"),
        errDelay(6000, "F"),
      ]),
    [
      Error("A failed"),
      Error("B failed"),
      Error("C failed"),
      Error("D failed"),
      Error("E failed"),
      Error("F failed"),
    ],
  );
}

runTests();
