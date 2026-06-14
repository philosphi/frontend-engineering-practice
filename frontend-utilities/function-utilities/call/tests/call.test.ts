import assert from "assert/strict";
import { myCall2 } from "../src/call2";

declare global {
  interface Function {
    myCall(this: Function, thisArg: unknown, ...args: unknown[]): unknown;
  }
}

(Function.prototype as any).myCall = myCall2;

const multiplier = {
  multiplyBy2: (x: number) => x * 2,
};
function double(this: typeof multiplier, x: number) {
  return this.multiplyBy2(x);
}

// basic call
assert.deepStrictEqual(double.myCall(multiplier, 3), 6);

const adder = {
  add: (x: number, y: number) => x + y,
};
function sum(this: typeof adder, x: number, y: number) {
  return this.add(x, y);
}

// basic call with multiple arguments
assert.deepStrictEqual(sum.myCall(adder, 3, 3), 6);

function sayHello(this: typeof sayHello) {
  return this.language;
}
sayHello.language = "english";

// basic call when thisArg is a function
assert.deepStrictEqual(sayHello.myCall(sayHello), "english");

// thisArg is the same after a call (no symbol key)
const symbolsBefore = Object.getOwnPropertySymbols(sayHello).length;
sayHello.myCall(sayHello);
const symbolsAfter = Object.getOwnPropertySymbols(sayHello).length;
assert.deepStrictEqual(symbolsBefore, symbolsAfter);

// throws when this is not a function
assert.throws(() => myCall2.call({} as any, multiplier, 3), TypeError);

// throws when thisArg is undefined
assert.throws(() => double.myCall(undefined, 3), TypeError);

// throws when thisArg is null
assert.throws(() => double.myCall(null, 3), TypeError);

// throws when thisArg is a primitive
assert.throws(() => double.myCall(123, 3), TypeError);
