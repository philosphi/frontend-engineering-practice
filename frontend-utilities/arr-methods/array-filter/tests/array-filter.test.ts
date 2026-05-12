import assert from "assert/strict";
import { myFilter } from "../src/array-filter";

declare global {
  interface Array<T> {
    myFilter(
      callback: (item: T, index: number, array: T[]) => boolean,
      thisArg?: unknown,
    ): T[];
  }
}

(Array.prototype as any).myFilter = myFilter;

// basic filter transformation
assert.deepStrictEqual(
  [1, 2, 3].myFilter((x) => x > 1),
  [2, 3],
);

// callback accepts an index parameter
assert.deepStrictEqual(
  [1, 2, 2].myFilter((x, i) => x > i),
  [1, 2],
);

// callback accepts an array parameter
assert.deepStrictEqual(
  [1, 2, 3].myFilter((x, i, arr) => x === arr[i]),
  [1, 2, 3],
);

// accepts a thisArg parameter
const filter = {
  greaterThanOne: function (x: number) {
    return x > 1;
  },
};

assert.deepStrictEqual(
  [1, 2, 3].myFilter(function (this: typeof filter, x) {
    return this.greaterThanOne(x);
  }, filter),
  [2, 3],
);

// skips over holes in a sparse array
assert.deepStrictEqual(
  ([1, , 3] as number[]).myFilter((x) => x > 1),
  [3],
);

// handles undefined value in an array
assert.deepStrictEqual(
  ([1, undefined, 3] as number[]).myFilter((x) => x > 1 || x === undefined),
  [undefined, 3],
);

// throws an error when callback is not a function
assert.throws(() => [1, 2, 3].myFilter(123 as any), TypeError);
