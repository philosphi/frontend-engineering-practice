import assert from "assert/strict";
import { myReduce2 } from "../src/array-reduce2";

declare global {
  interface Array<T> {
    myReduce<V>(
      callback: (accumulator: V, item: T, index: number, arr: T[]) => V,
      initialValue?: V,
    ): V;
  }
}

(Array.prototype as any).myReduce = myReduce2;

// basic reduce
assert.deepStrictEqual(
  [1, 2, 3].myReduce((acc: number, x) => acc + x),
  6,
);

// basic reduce with initial value
assert.deepStrictEqual(
  [1, 2, 3].myReduce((acc: number, x) => acc + x, 0),
  6,
);

// callback accepts an index
assert.deepStrictEqual(
  [1, 2, 3].myReduce((acc: number, _, i) => acc + i),
  4,
);

// callback accepts an array
assert.deepStrictEqual(
  [1, 2, 3].myReduce((acc: number, _, i, arr) => acc + arr[i]!),
  6,
);

// // accepts a thisArg
// const reducer = {
//   sum: (acc: number, x: number) => acc + x,
// };
// assert.deepStrictEqual(
//   [1, 2, 3].myReduce(
//     function (this: typeof reducer, acc: number, x) {
//       return this.sum(acc, x);
//     },
//     1,
//     reducer,
//   ),
//   7,
// );

// handles sparse arrays
assert.deepStrictEqual(
  ([1, , 3] as number[]).myReduce((acc: number, x) => acc + x),
  4,
);

// throws when callback is a non-function
assert.throws(() => [1, 2, 3].myReduce(123 as any), TypeError);

// throws when array is empty with no initial value
assert.throws(() => [].myReduce((acc, x) => acc + x), TypeError);
