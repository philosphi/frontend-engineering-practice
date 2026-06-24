import assert from "assert/strict";
import { myFlatten2 as myFlatten } from "../src/array-flatten2";

declare global {
  interface Array<T> {
    myFlatten(this: T[], depth?: number): T[];
  }
}

(Array.prototype as any).myFlatten = myFlatten;

// flat array with depth 0
assert.deepStrictEqual([1, 2, 3].myFlatten(0), [1, 2, 3]);

// flat array
assert.deepStrictEqual([1, 2, 3].myFlatten(), [1, 2, 3]);

// nested array with depth 0
assert.deepStrictEqual([1, [2, 3]].myFlatten(0), [1, [2, 3]]);

// nested array
assert.deepStrictEqual([1, [2, 3]].myFlatten(), [1, 2, 3]);

// nested array with mixed primitives
assert.deepStrictEqual([1, ["hi", 3]].myFlatten(), [1, "hi", 3]);

// deeply nested array with depth 2
assert.deepStrictEqual([1, [2, [3]]].myFlatten(2), [1, 2, 3]);

// deeply nested array with depth infinity
assert.deepStrictEqual([1, [2, [3]]].myFlatten(Infinity), [1, 2, 3]);

// sparse array
assert.deepStrictEqual([1, , [3]].myFlatten(), [1, 3]);

assert.deepStrictEqual([1, [2, [3, 4]]].myFlatten(0), [1, [2, [3, 4]]]);
