import assert from "assert/strict";
import { deepEqual2 as deepEqual } from "../src/deep-equal2";

// primitive value
let valueA: unknown = 123;
let valueB: unknown = 123;
assert.strictEqual(deepEqual(valueA, valueB), true);

valueB = "123";
assert.strictEqual(deepEqual(valueA, valueB), false);

// mixed primitive value and object
valueB = {};
assert.strictEqual(deepEqual(valueA, valueB), false);

// undefined value
valueA = undefined;
valueB = undefined;
assert.deepStrictEqual(deepEqual(valueA, valueB), true);

// null value
valueA = null;
valueB = null;
assert.deepStrictEqual(deepEqual(valueA, valueB), true);

// empty object
valueA = {};
valueB = {};
assert.deepStrictEqual(deepEqual(valueA, valueB), true);

// flat object
valueA = { name: "Phi" };
valueB = { name: "Phi" };
assert.deepStrictEqual(deepEqual(valueA, valueB), true);

valueB = { name: "Phi", sex: "male" };
assert.deepStrictEqual(deepEqual(valueA, valueB), false);

// flat array
valueA = [123, 456];
valueB = [123, 456];
assert.deepStrictEqual(deepEqual(valueA, valueB), true);

valueB = [123, 789];
assert.deepStrictEqual(deepEqual(valueA, valueB), false);

// nested object
valueA = {
  name: "Phi",
  occupation: {
    role: "Software Engineer",
    company: "Self-Employed",
  },
};
valueB = {
  name: "Phi",
  occupation: {
    role: "Software Engineer",
    company: "Self-Employed",
  },
};
assert.deepStrictEqual(deepEqual(valueA, valueB), true);

valueB = {
  name: "Phi",
  occupation: {
    role: "Software Engineer",
    company: "Employed",
  },
};
assert.deepStrictEqual(deepEqual(valueA, valueB), false);

// nested array
valueA = [["abc"], 123];
valueB = [["abc"], 123];
assert.deepStrictEqual(deepEqual(valueA, valueB), true);

valueB = [["123"], 123];
assert.deepStrictEqual(deepEqual(valueA, valueB), false);

// circular reference
valueA = { name: "Phi" };
let extendedValueA = valueA as unknown & { friend: typeof valueA };
extendedValueA.friend = valueA;
valueB = { name: "Phi" };
let extendedValueB = valueB as unknown & { friend: typeof valueB };
extendedValueB.friend = valueB;
assert.deepStrictEqual(deepEqual(extendedValueA, extendedValueB), true);

// circular reference at different depths
valueA = { name: "Phi" };
extendedValueA = valueA as unknown & { friend: unknown };
valueB = { name: "Phin" };
extendedValueB = valueB as unknown & { friend: unknown };
extendedValueA.friend = extendedValueB;
extendedValueB.friend = extendedValueA;

let valueC: unknown = { name: "Phi" };
let extendedValueC = valueC as unknown & { friend: unknown };
let valueD: unknown = { name: "Phin" };
let extendedValueD = valueD as unknown & { friend: unknown };
extendedValueC.friend = extendedValueD;
extendedValueD.friend = extendedValueD;
assert.deepStrictEqual(deepEqual(extendedValueA, extendedValueC), false);

// date object
valueA = new Date("2026-05-15");
valueB = new Date("2026-05-15");
assert.deepStrictEqual(deepEqual(valueA, valueB), true);

valueB = new Date("2026-05-16");
assert.deepStrictEqual(deepEqual(valueA, valueB), false);

// regexp object
valueA = RegExp("phi", "i");
valueB = RegExp("phi", "i");
assert.deepStrictEqual(deepEqual(valueA, valueB), true);

valueB = RegExp("phin", "i");
assert.deepStrictEqual(deepEqual(valueA, valueB), false);

// array mismatch with plain object
valueA = [1, 2];
valueB = { 0: 1, 1: 2 };
assert.deepStrictEqual(deepEqual(valueA, valueB), false);

// different array lengths
valueA = [1, 2];
valueB = [1, 4, 3];
assert.deepStrictEqual(deepEqual(valueA, valueB), false);

// date mismatch with plain object
valueA = new Date();
valueB = { getTime: () => 0 };
assert.deepStrictEqual(deepEqual(valueA, valueB), false);
