import assert from "assert/strict";
import { myBind } from "../src/bind";

(Function.prototype as any).myBind = myBind;

declare global {
  interface Function {
    myBind(
      this: Function,
      thisArg: unknown,
      ...args: unknown[]
    ): (...bindArgs: unknown[]) => unknown;
  }
}

(Function.prototype as any).myBind = myBind;

const multiplier = {
  multiplyBy2: (x: number) => x * 2,
};
function double(this: typeof multiplier, x: number) {
  return this.multiplyBy2(x);
}

// basic call
assert.deepStrictEqual(double.myBind(multiplier, 3)(), 6);

const adder = {
  add: (x: number, y: number) => x + y,
};
function sum(this: typeof adder, x: number, y: number) {
  return this.add(x, y);
}

// basic call with multiple arguments
assert.deepStrictEqual(sum.myBind(adder, 3, 3)(), 6);

function sayHello(this: typeof sayHello) {
  return this.language;
}
sayHello.language = "english";

// basic call when thisArg is a function
assert.deepStrictEqual(sayHello.myBind(sayHello)(), "english");

// thisArg is the same after a call (no symbol key)
const symbolsBefore = Object.getOwnPropertySymbols(sayHello).length;
sayHello.myBind(sayHello);
const symbolsAfter = Object.getOwnPropertySymbols(sayHello).length;
assert.deepStrictEqual(symbolsBefore, symbolsAfter);

// throws when this is not a function
assert.throws(() => myBind.call({} as any, multiplier, 3)(), TypeError);

// throws when thisArg is undefined
assert.throws(() => double.myBind(undefined, 3)(), TypeError);

// throws when thisArg is null
assert.throws(() => double.myBind(null, 3)(), TypeError);

// throws when thisArg is a primitive
assert.throws(() => double.myBind(123, 3)(), TypeError);
