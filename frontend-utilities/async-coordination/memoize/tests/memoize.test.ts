import assert from "assert/strict";
import { memoize2 } from "../src/memoize2";

// returns cached result
let callCount = 0;
function add(a: number, b: number) {
  callCount++;
  return a + b;
}
const memoize2dAdd = memoize2(add);
memoize2dAdd(5, 4);
memoize2dAdd(5, 4);

assert.deepEqual(memoize2dAdd(5, 4), 9);
assert.deepEqual(callCount, 1);

// same arguments in different order generates different cached results
assert.deepEqual(memoize2dAdd(4, 5), 9);
assert.deepEqual(callCount, 2);

// different arguments generates different cached results
assert.deepEqual(memoize2dAdd(5, 5), 10);
assert.deepEqual(callCount, 3);

// sets the this from the caller into the original function
callCount = 0;

function multiply<T extends { factor: number }>(this: T, a: number) {
  callCount++;
  return a * this.factor;
}

const memoize2dMultiply = memoize2(multiply);

const multiplier = {
  factor: 3,
  multiply: memoize2dMultiply,
};

assert.deepEqual(multiplier.multiply(3), 9);
assert.deepEqual(callCount, 1);