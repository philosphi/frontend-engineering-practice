import assert from "assert/strict";
import { deepClone } from "../src/deep-clone";

// primitive value
let original: unknown = 123;
assert.deepStrictEqual(deepClone(original), original);

// undefined value
original = undefined;
assert.deepStrictEqual(deepClone(original), original);

// null value
original = null;
assert.deepStrictEqual(deepClone(original), original);

// empty object
original = {};
assert.deepStrictEqual(deepClone(original), original);
assert.notStrictEqual(deepClone(original), original);

// flat object
original = { name: "Phi" };
assert.deepStrictEqual(deepClone(original), original);
assert.notStrictEqual(deepClone(original), original);

// flat array
original = [123, 456];
assert.deepStrictEqual(deepClone(original), original);
assert.notStrictEqual(deepClone(original), original);

// nested object
original = {
  name: "Phi",
  occupation: {
    role: "Software Engineer",
    company: "Self-Employed",
  },
};
assert.deepStrictEqual(deepClone(original), original);
assert.notStrictEqual(deepClone(original), original);

// nested array
original = [["abc"], 123];
assert.deepStrictEqual(deepClone(original), original);
assert.notStrictEqual(deepClone(original), original);

// circular reference
original = { name: "Phi" };
let extendedOriginal = original as unknown & { friend: typeof original };
extendedOriginal.friend = original;
let clone: typeof extendedOriginal = deepClone(extendedOriginal);
assert.deepStrictEqual(clone, extendedOriginal);
assert.notStrictEqual(clone, extendedOriginal);
assert.strictEqual(clone.friend, clone);

// date object
original = new Date("2026-05-15");
assert.deepStrictEqual(deepClone(original), original);
assert.notStrictEqual(deepClone(original), original);

// regexp object
original = RegExp("phi", "i");
assert.deepStrictEqual(deepClone(original), original);
assert.notStrictEqual(deepClone(original), original);
