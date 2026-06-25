import assert from "assert/strict";
import { promiseAllSettled } from "../src/promise-allsettled";

const delay = (ms: number, label: string) => {
  return new Promise<string>((resolve) =>
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

async function testResolves<T>(
  label: string,
  fn: Function,
  expectedResult: PromiseSettledResult<T>[],
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

async function runTests() {
  await testResolves(
    "handles empty task array",
    async () => promiseAllSettled([]),
    [],
  );

  await testResolves(
    "preserves original order",
    async () =>
      promiseAllSettled([
        delay(1000, "A"),
        delay(500, "B"),
        delay(800, "C"),
        delay(300, "D"),
        delay(600, "E"),
      ]),
    [
      { status: "fulfilled", value: "A" },
      { status: "fulfilled", value: "B" },
      { status: "fulfilled", value: "C" },
      { status: "fulfilled", value: "D" },
      { status: "fulfilled", value: "E" },
    ],
  );

  await testResolves(
    "resolves with promise rejected",
    async () =>
      promiseAllSettled([
        delay(1000, "A"),
        delay(500, "B"),
        delay(800, "C"),
        delay(1200, "D"),
        errDelay(300, "E"),
        delay(6000, "F"),
      ]),
    [
      { status: "fulfilled", value: "A" },
      { status: "fulfilled", value: "B" },
      { status: "fulfilled", value: "C" },
      { status: "fulfilled", value: "D" },
      { status: "rejected", reason: Error("E failed") },
      { status: "fulfilled", value: "F" },
    ],
  );
}

runTests();
