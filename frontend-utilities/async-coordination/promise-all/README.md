# Promise.all Polyfill

## Problem Statement

Implement `Promise.all` — a function that takes an array of promises and returns a single promise that resolves with an array of resolved values when all input promises resolve, preserving input order. Rejects immediately with the first rejection reason if any promise rejects.

## Concepts Exercised

- Promise combinator pattern
- `.then` / `.catch` as observers, not executors
- Indexed result assignment to preserve order
- Pre-increment counter check for collective resolution
- Empty array edge case

## My Approach

Return a `new Promise` wrapper. Attach `.then` and `.catch` to each input promise via `forEach`. In `.then`, assign the result to the correct index and check if all promises have resolved using a pre-incremented counter. In `.catch`, reject the outer promise immediately. Guard against an empty input array by resolving immediately before the loop.

## Implementation Notes

- Input is `Promise<unknown>[]` — promises already in flight, not factories
- Results initialized as `new Array(promises.length)` — fixed size preserves sparse index structure
- `++resolvedCount === promises.length` — pre-increment is load-bearing; post-increment checks the old value and misses the last resolution
- Index into results (`results[index] = result`), never push — promises settle out of order but results must reflect input order
- In-flight promises are not cancelled on rejection — JavaScript has no cancellation primitive; remaining promises run to completion

## Lessons Learned

**Two failure modes documented:**

1. **Promise Queue contamination** — reached for factory functions and a recursive task runner. Wrong pattern: Promise Queue controls when work starts; Promise.all observes work already started. The input type is the discriminator — factories vs promises.
2. **Sequential await trap** — initial implementation used `await` inside a `for` loop, serializing what should be concurrent. The `.then`/`.catch` approach is required — attaches observers to all promises without blocking between attachments.
   **On promise execution:** Promises begin executing the moment they are constructed. The executor callback inside `new Promise(executor)` runs immediately and synchronously. By the time an array of promises reaches `promiseAll`, all async work is already in flight. `.then` and `.catch` do not execute promises — they observe outcomes.

**TypeScript gap flagged:** Current signature `Promise<unknown>[]` → `Promise<unknown[]>` loses per-promise type information. Native `Promise.all` uses overloaded signatures with variadic tuple inference to return `[string, number]` instead of `unknown[]`. Revisit during Phase 3 capstone when conditional types and variadic tuples are active retrieval items.

## Testing Strategy

Four behavioral assertions:

- `handles empty task array` — resolves immediately with `[]`
- `preserves original order` — five promises with staggered delays; result order must match input order, not settlement order
- `rejects on task failure` — one rejection among several resolutions; outer promise must reject with the correct error
- `handles concurrency greater than tasks` — confirms all promises run concurrently; total time should be ~max(delays), not sum(delays)
  Concurrent execution verified: test with delays `[1000, 500, 800, 300, 600]ms` completed in ~1000ms total. Settlement order `(D, B, E, C, A)` confirmed delay-order settlement with correct indexed placement in results.
