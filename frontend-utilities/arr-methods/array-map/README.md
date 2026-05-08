# Array.prototype.map Polyfill

A TypeScript implementation of `Array.prototype.map` with sparse array handling.

## Approach

Implemented as a standalone generic function with an explicit `this: T[]` 
parameter. The core loop uses the `in` operator to check for sparse array 
holes — correctly distinguishing between a missing index and an index 
explicitly set to `undefined`. Each element is passed to the callback via 
`callback.call(this, item, index, array)`, matching native map's 
three-argument signature.

## TypeScript Decisions

- `<T, V>` generics separate input and output element types
- `this[i]!` non-null assertion required due to `noUncheckedIndexedAccess` 
  — the `in` check guarantees the value exists but TypeScript can't infer that
- Callback typed as `(item: T, index: number, array: T[]) => V`

## Edge Cases

- Sparse holes skipped via `i in this`, not `=== undefined`
- Non-function callback throws `TypeError` before iteration begins

## Limitations

Omits the optional `thisArg` second argument that native `map` accepts for 
binding callback `this`. Callback `this` always binds to the source array.

## Tests

Six assertions: basic transformation, callback receives index, callback 
receives full array reference, sparse hole preservation, type transformation, 
TypeError on non-function callback.