import { myCurry2 } from "../src/curry2";
import assert from "assert/strict";

const multiply = (x: number, y: number) => {
  return x * y;
};

const curriedMultiply = myCurry2(multiply);

const double = curriedMultiply(2);

assert.deepStrictEqual(double(2), 4);
assert.deepStrictEqual(double(4), 8);

const multiplyAll = curriedMultiply();

assert.deepStrictEqual(multiplyAll(2, 3), 6);
assert.deepStrictEqual(multiplyAll(2)(3), 6);

const printLabel = (label: string, x: number) => {
  return `${label}: ${x}`;
};

const curriedPrintLabel = myCurry2(printLabel);

const printGroup = curriedPrintLabel("Group");

assert.deepStrictEqual(printGroup(2), "Group: 2");
