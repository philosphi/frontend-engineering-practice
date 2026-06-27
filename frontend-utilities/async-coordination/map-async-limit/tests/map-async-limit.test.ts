import assert from "assert/strict";
import { mapAsyncLimit } from "../src/map-async-limit";

const delay = ({
  ms,
  label,
}: {
  ms: number;
  label: string;
}): Promise<string> => {
  active++;
  if (active > peak) {
    peak = active;
  }
  if (ms < 0) {
    throw new Error("ms must be non negative");
  }
  return new Promise((resolve) =>
    setTimeout(() => {
      active--;
      resolve(label);
    }, ms),
  );
};

async function testResolves(
  label: string,
  fn: Function,
  expectedResult: string[],
  expectedPeak: number,
) {
  try {
    const results = await fn();
    assert.deepStrictEqual(results, expectedResult);
    assert.deepStrictEqual(peak, expectedPeak);
    console.log(`✓ ${label}`);
  } catch (err) {
    if (err instanceof Error) console.log(`✗ ${label}: ${err.message}`);
  }
}

async function testRejects(
  label: string,
  fn: Function,
  expectedError: Error,
  expectedPeak: number,
) {
  try {
    await fn();
    console.log(`✗ ${label}: expected rejection but resolved`);
  } catch (err) {
    if (err instanceof Error) {
      assert.strictEqual(peak, expectedPeak);
      assert.deepStrictEqual(err, expectedError);
      console.log(`✓ ${label}: ${err.message}`);
    }
  }
}

function resetTrackers() {
  active = 0;
  peak = 0;
}

async function runTests() {
  await testResolves(
    "handles empty items array",
    async () => mapAsyncLimit([], delay, 2),
    [],
    0,
  );

  resetTrackers();
  await testResolves(
    "preserves original order",
    async () =>
      mapAsyncLimit(
        [
          {
            ms: 1000,
            label: "A",
          },
          {
            ms: 500,
            label: "B",
          },
          {
            ms: 800,
            label: "C",
          },
          {
            ms: 300,
            label: "D",
          },
          {
            ms: 600,
            label: "E",
          },
        ],
        delay,
        2,
      ),
    ["A", "B", "C", "D", "E"],
    2,
  );

  resetTrackers();
  await testRejects(
    "rejects on task failure",
    async () =>
      mapAsyncLimit(
        [
          {
            ms: 1000,
            label: "A",
          },
          {
            ms: 500,
            label: "B",
          },
          {
            ms: 800,
            label: "C",
          },
          {
            ms: -300,
            label: "D",
          },
          { ms: 300, label: "E" },
          {
            ms: 6000,
            label: "F",
          },
        ],
        delay,
        3,
      ),
    Error("ms must be non negative"),
    3,
  );

  resetTrackers();
  await testResolves(
    "handles concurrency greater than tasks",
    async () =>
      mapAsyncLimit(
        [
          {
            ms: 1000,
            label: "A",
          },
          {
            ms: 500,
            label: "B",
          },
          {
            ms: 800,
            label: "C",
          },
          {
            ms: 300,
            label: "D",
          },
          {
            ms: 600,
            label: "E",
          },
        ],
        delay,
        6,
      ),
    ["A", "B", "C", "D", "E"],
    5,
  );
}

let active = 0;
let peak = 0;

runTests();
