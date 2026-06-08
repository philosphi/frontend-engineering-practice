# A7 — Deep Equal

## Problem Statement

A utility function that performs a deep structural comparison between two values, returning `true` if their contents are equivalent at every level of nesting. Handles primitive values, `null`, `undefined`, nested objects, nested arrays, `Date` objects, `RegExp` objects, and circular references.

## Concepts Exercised

- Recursive tree traversal
- Cycle detection via `WeakSet`
- Structural equality vs reference equality
- Type narrowing — `instanceof`, `Array.isArray`, explicit null/undefined guards
- `typeof` coarseness and its limitations
- Type mismatch guards for heterogeneous inputs
- Construction-boundary `any` — relaxing type safety during dynamic traversal, asserting at the return boundary
- Short-circuit evaluation — primitive guard returns before any object operations

## My Approach

The function maintains two `Set` instances at outer scope — one per value graph — to track visited objects across all recursive invocations. An inner recursive function `isEqual` first checks whether both values have been visited before (cycle detected — return `true`), or only one has (asymmetric structure — return `false`). If neither has been visited, it checks whether the values are primitive, `null`, or `undefined` and returns strict equality directly. For object types, explicit mismatch guards run before branching — array vs plain object, `Date` vs plain object, `RegExp` vs plain object — each returning `false` immediately on mismatch. Once the specific type is confirmed on both sides, the function handles each branch: arrays iterate by index, `Date` objects compare via `getTime()`, `RegExp` objects compare `source` and `flags`. Plain objects register in the visited sets before iterating keys, then recurse into each value. Key count mismatch short-circuits before recursion.

## Implementation Notes

Two `Set` instances are created once at outer scope and shared across all recursive calls via closure — this is what makes cycle detection work across the full traversal. The cycle check runs at the very top of `isEqual` before any type checks, because for arbitrarily deep structures the check must travel with the recursion — gating from outside the recursive call is insufficient.

Registration into the visited sets happens after all mismatch guards and special type branches, immediately before object key iteration. Registering before the mismatch guards would pollute the sets with objects that compared unequal, potentially causing false positives later in the traversal.

`Date` comparison uses `getTime()` rather than `toDateString()` — the latter drops the time component entirely, causing two `Date` objects at different times on the same day to compare as equal.

`any` is used during dynamic key access on the object branch — TypeScript cannot verify `T[keyof T] as T` at the type level, so `any` is used locally and contained. It does not leak to callers.

The inner function is typed as `(valA: unknown, valB: unknown): boolean` — honest about what it accepts, forcing explicit narrowing at each branch via `instanceof` and `Array.isArray`.

## Testing Strategy

Tests cover: primitive equality and mismatch, `null`, `undefined`, empty objects, flat objects (equal and unequal), flat arrays (equal and unequal), nested objects (equal and unequal), nested arrays (equal and unequal), circular references (equal structures and asymmetric structures), `Date` objects (equal and unequal), `RegExp` objects (equal and unequal).

Missing cases to add: array vs plain object mismatch, `Date` vs plain object mismatch, different length arrays, different key count objects.

## Lessons Learned

- `typeof` is coarse — it returns `'object'` for plain objects, arrays, `Date`, `RegExp`, and `null`. It does not narrow to the specific type. Use `instanceof` and `Array.isArray` for precise branching.
- `forEach` callbacks cannot return a value that affects the outer function. Use a flag set to `false` inside the callback and read it after iteration completes.
- Cycle detection must occur at the top of the recursive function — not gated from outside the call site. For arbitrarily deep structures, the check must travel with the recursion.
- Registration into visited sets must happen after mismatch guards are resolved, not before. Premature registration pollutes the sets with unequal objects.
- `Date` comparison requires `getTime()` for full timestamp precision. `toDateString()` silently drops the time component.
