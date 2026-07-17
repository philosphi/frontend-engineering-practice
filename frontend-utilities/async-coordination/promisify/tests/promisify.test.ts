import { promisify, Callback } from "../src/promisify";
import assert from "assert";

const delay = (ms: number, callback: Callback<string>) => {
  setTimeout(() => {
    callback(null, `delayed for ${ms} ms`);
  }, ms);
};

const undefDelay = (ms: number, callback: Callback<string>) => {
  setTimeout(() => {
    callback(null);
  }, ms);
};

const errDelay = (ms: number, callback: Callback<string>) => {
  setTimeout(() => {
    callback(new Error(`error thrown after ${ms} ms`));
  }, ms);
};

const delayed = promisify(delay);
const undefDelayed = promisify(undefDelay);
const errDelayed = promisify(errDelay);

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

async function testRejects(label: string, fn: Function, expectedError: Error) {
  try {
    await fn();
    console.log(`✗ ${label}: expected rejection but resolved`);
  } catch (err) {
    if (err instanceof Error) {
      console.log(`✓ ${label}`);
      assert.deepStrictEqual(err, expectedError);
    }
  }
}

const runTests = async () => {
  await testResolves(
    "awaits for 2 seconds before resolving",
    async () => await delayed(2000),
    "delayed for 2000 ms",
  );
  await testRejects(
    "awaits for 3 seconds before rejecting",
    async () => await errDelayed(3000),
    Error("error thrown after 3000 ms"),
  );
  await testRejects(
    "awaits for 3 seconds before rejecting with undefined data",
    async () => await undefDelayed(3000),
    Error("data is undefined"),
  );
};

runTests();
