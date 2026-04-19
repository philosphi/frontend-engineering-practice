import { promiseQueue } from "./promiseQueue.js";
import assert from "assert";

const delay = (ms, label) => () => {
  active++;
  if (active > peak) {
    peak = active;
  }
  return new Promise((resolve) =>
    setTimeout(() => {
      active--;
      resolve(label);
    }, ms),
  );
};

const errDelay = (ms, label) => () => {
  active++;
  if (active > peak) {
    peak = active;
  }
  return new Promise((_, reject) =>
    setTimeout(() => {
      active--;
      reject(new Error(label + " failed"));
    }, ms),
  );
};

async function testResolves(label, fn, expectedResult, expectedPeak) {
  try {
    const results = await fn();
    assert.deepStrictEqual(results, expectedResult);
    assert.deepStrictEqual(peak, expectedPeak);
    console.log(`✓ ${label}`);
  } catch (err) {
    console.log(`✗ ${label}: ${err.message}`);
  }
}

async function testRejects(label, fn, expectedPeak) {
  try {
    await fn();
    console.log(`✗ ${label}: expected rejection but resolved`);
  } catch (err) {
    assert.strictEqual(peak, expectedPeak);
    console.log(`✓ ${label}: ${err.message}`);
  }
}

function resetTrackers() {
  active = 0;
  peak = 0;
}

async function runTests() {
  await testResolves(
    "handles empty task array",
    async () => promiseQueue([], 2),
    [],
    0,
  );

  resetTrackers();
  await testResolves(
    "preserves original order",
    async () =>
      promiseQueue(
        [
          delay(1000, "A"),
          delay(500, "B"),
          delay(800, "C"),
          delay(300, "D"),
          delay(600, "E"),
        ],
        2,
      ),
    ["A", "B", "C", "D", "E"],
    2,
  );

  resetTrackers();
  await testRejects(
    "rejects on task failure",
    async () =>
      promiseQueue(
        [
          delay(1000, "A"),
          delay(500, "B"),
          delay(800, "C"),
          delay(1200, "D"),
          errDelay(300, "E"),
          delay(6000, "F"),
        ],
        3,
      ),
    3,
  );

  resetTrackers();
  await testResolves(
    "handles concurrency greater than tasks",
    async () =>
      promiseQueue(
        [
          delay(1000, "A"),
          delay(500, "B"),
          delay(800, "C"),
          delay(300, "D"),
          delay(600, "E"),
        ],
        6,
      ),
    ["A", "B", "C", "D", "E"],
    5,
  );
}

let active = 0;
let peak = 0;

runTests();
