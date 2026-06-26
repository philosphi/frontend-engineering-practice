import assert from "assert/strict";
import { memoize } from "../src/memoize";

// returns cached result
let callCount = 0;
function add(a: number, b: number) {
  callCount++;
  return a + b;
}
const memoizedAdd = memoize(add);
memoizedAdd(5, 4);
memoizedAdd(5, 4);

assert.deepEqual(memoizedAdd(5, 4), 9);
assert.deepEqual(callCount, 1);

// same arguments in different order generates different cached results
assert.deepEqual(memoizedAdd(4, 5), 9);
assert.deepEqual(callCount, 2);

// different arguments generates different cached results
assert.deepEqual(memoizedAdd(5, 5), 10);
assert.deepEqual(callCount, 3);

// sets the this from the caller into the original function
callCount = 0;

function multiply<T extends { factor: number }>(this: T, a: number) {
  callCount++;
  return a * this.factor;
}

const memoizedMultiply = memoize(multiply);

const multiplier = {
  factor: 3,
  multiply: memoizedMultiply,
};

assert.deepEqual(multiplier.multiply(3), 9);
assert.deepEqual(callCount, 1);
