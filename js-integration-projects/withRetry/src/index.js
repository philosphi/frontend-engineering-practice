import assert from "assert";
import { withRetry } from "./withRetry.js";

const retryFn = async (maxRetries) => {
  if (retryCount < maxRetries) {
    console.log(`function failed after ${retryCount} retries`);
    throw retryCount++;
  }
  console.log(`function suceeded with ${retryCount} retry`);
  return retryCount;
};

const asyncTest = async (label, fn, expectedResult, expectedElapsedTime) => {
  let rejected;
  let startTime = Date.now();
  const result = await fn().catch((err) => {
    rejected = true;
    assert.deepStrictEqual(err, expectedResult);
  });
  if (!rejected) {
    assert.strictEqual(result, expectedResult);
  }
  if (expectedElapsedTime) {
    let elapsedTime = Date.now() - startTime;
    assert(elapsedTime >= expectedElapsedTime);
  }
  console.log(`✓ ${label}`);
};

const resetTests = () => {
  retryCount = 0;
};

const testRunner = async () => {
  await asyncTest(
    "should throw invalid function error error",
    () => withRetry("invalid", { maxRetries: 3, baseDelay: 1000 }),
    new TypeError("fn must be a function"),
  );

  await asyncTest(
    "should throw invalid max retries error",
    () => withRetry(() => retryFn(1), { maxRetries: -1, baseDelay: 1000 }),
    new RangeError("maxRetries must be a non-negative integer"),
  );

  await asyncTest(
    "should throw invalid max retries error",
    () => withRetry(() => retryFn(1), { maxRetries: 1.5, baseDelay: 1000 }),
    new RangeError("maxRetries must be a non-negative integer"),
  );

  await asyncTest(
    "should throw invalid base delay error",
    () => withRetry(() => retryFn(1), { maxRetries: 3, baseDelay: -1 }),
    new RangeError("baseDelay must be a non-negative number"),
  );

  resetTests();
  await asyncTest(
    "should succeed after one retry",
    () => withRetry(() => retryFn(1), { maxRetries: 3, baseDelay: 1000 }),
    1,
    1000,
  );

  resetTests();
  await asyncTest(
    "should succeed after two retries",
    () => withRetry(() => retryFn(2), { maxRetries: 3, baseDelay: 1000 }),
    2,
    3000,
  );

  resetTests();
  await asyncTest(
    "should fail after one retry",
    () => withRetry(() => retryFn(2), { maxRetries: 1, baseDelay: 1000 }),
    1,
    1000,
  );

  resetTests();
  await asyncTest(
    "should fail after two retries",
    () => withRetry(() => retryFn(3), { maxRetries: 2, baseDelay: 1000 }),
    2,
    3000,
  );
};

let retryCount = 0;

testRunner();
