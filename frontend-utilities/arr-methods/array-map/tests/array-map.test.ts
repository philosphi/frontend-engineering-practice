import assert from "assert/strict";
import { myMap } from "../src/array-map";

declare global {
  interface Array<T> {
    myMap<V>(
      callback: (item: T, index: number, array: T[]) => V,
      thisArg?: unknown,
    ): V[];
  }
}

(Array.prototype as any).myMap = myMap;

// basic transformation
assert.deepEqual(
  [1, 2, 3].myMap((x: number) => x * 2),
  [2, 4, 6],
);

// callback receives index
assert.deepEqual(
  [1, 2, 3].myMap((x: number, i) => x * i),
  [0, 2, 6],
);

// callback receives array
assert.deepEqual(
  [1, 2, 3].myMap((_, i, arr: number[]) => arr[i]! * 2),
  [2, 4, 6],
);

// accepts a thisArg parameter
const transformer = {
  double: (x: number) => x * 2,
};

assert.deepEqual(
  [1, 2, 3].myMap(function (this: typeof transformer, x) {
    return this.double(x);
  }, transformer),
  [2, 4, 6],
);

// callback receives array
assert.deepEqual(
  [1, 2, 3].myMap((_, i, arr: number[]) => arr[i]! * 2),
  [2, 4, 6],
);

// sparse array handling
assert.deepEqual(
  ([1, , 3] as number[]).myMap((x: number, i) => x * i),
  [0, , 6],
);

// type transformation (number → string)
assert.deepEqual(
  [1, 2, 3].myMap((x: number, i) => x.toString()),
  ["1", "2", "3"],
);

// throws on non-function callback
assert.throws(() => ([1, 2, 3] as any).myMap(123), TypeError);
