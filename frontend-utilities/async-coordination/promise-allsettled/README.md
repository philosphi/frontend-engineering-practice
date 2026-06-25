# Promise.allSettled Polyfill

## Problem Statement

Implement `Promise.allSettled` without using the native method. Given an array
of promises, return a promise that always resolves once every input promise has
settled — fulfilled or rejected — with an array of result objects describing
each outcome.

## Concepts Exercised

- Promise combinator pattern
- `.then → .catch → .finally` chain order and what "unconditional" means precisely
- `PromiseSettledResult<T>` discriminated union
- Indexed assignment for order preservation under concurrent settlement

## My Approach

Same outer shell as Promise.all: `new Promise` wrapper, fixed-size results array,
empty array guard, `forEach` attaching observers to each promise. Key difference:
no `reject` call anywhere. Every settlement — success or failure — writes a
structured result object to the indexed position and increments `terminatedCount`
in `.finally`. When `terminatedCount` reaches `promises.length`, the outer
promise resolves with the full results array.

## Implementation Notes

- `.finally` chains off `.catch`, not `.then`. This is load-bearing: fulfilled
  promises skip `.catch`; rejected promises skip `.then`. `.finally` fires after
  whichever branch ran. Chaining off `.then` only silently breaks counter
  increment for rejections.
- Result shapes are exact: `{ status: "fulfilled", value: T }` and
  `{ status: "rejected", reason: unknown }`. Field names are spec-defined.
- `reason` stores the raw Error object, not `error.message`. Test expectations
  must use `Error("...")` not a plain string.

## Lessons Learned

- The minimal semantic diff from Promise.all is the absence of `reject` and the
  always-resolves contract. The entire structural difference is one missing call.
- "Finally fires unconditionally" means after whichever branch fired — not after
  both. Fulfilled path: `.then` → `.finally`. Rejected path: `.catch` → `.finally`.
- Reproduction priority: Medium. Chain order is a non-obvious failure mode that
  wouldn't surface without a rejection test case.

## Testing Strategy

- Empty array resolves immediately with `[]`
- All fulfilled: order preserved under concurrent settlement (verified with
  staggered delays)
- Mixed: rejected promise produces correct shape at correct index; remaining
  promises resolve normally; outer promise still resolves
