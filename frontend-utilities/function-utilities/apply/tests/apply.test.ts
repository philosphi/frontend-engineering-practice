import assert from "assert/strict";
import { myApply2 } from "../src/apply2";

declare global {
  interface Function {
    myApply(this: Function, thisArg?: unknown, ...args: unknown[]): unknown;
  }
}

(Function.prototype as any).myApply = myApply2;

const multiplier = {
  multiplyBy2: (x: number) => x * 2,
};
function double(this: typeof multiplier, x: number) {
  return this.multiplyBy2(x);
}

// basic Apply
assert.deepStrictEqual(double.myApply(multiplier, [3]), 6);

const adder = {
  add: (x: number, y: number) => x + y,
};
function sum(this: typeof adder, x: number, y: number) {
  return this.add(x, y);
}

// basic Apply with multiple arguments
assert.deepStrictEqual(sum.myApply(adder, [3, 3]), 6);

function sayHello(this: typeof sayHello) {
  return this.language;
}
sayHello.language = "english";

// basic Apply when thisArg is a function
assert.deepStrictEqual(sayHello.myApply(sayHello), "english");

// thisArg is the same after a Apply (no symbol key)
const symbolsBefore = Object.getOwnPropertySymbols(sayHello).length;
sayHello.myApply(sayHello);
const symbolsAfter = Object.getOwnPropertySymbols(sayHello).length;
assert.deepStrictEqual(symbolsBefore, symbolsAfter);

// throws when this is not a function
assert.throws(() => myApply2.apply({} as any, [multiplier, [3]]), TypeError);

// throws when thisArg is undefined
assert.throws(() => double.myApply(undefined, [3]), TypeError);

// throws when thisArg is null
assert.throws(() => double.myApply(null, [3]), TypeError);

// throws when thisArg is a primitive
assert.throws(() => double.myApply(123, [3]), TypeError);
