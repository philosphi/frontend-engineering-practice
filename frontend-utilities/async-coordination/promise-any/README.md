# Promise.any Polyfill

## Problem Statement

Implement `Promise.any` without using the native method. Given an array of
promises, return a promise that resolves with the value of the first promise
to fulfill. If all promises reject, reject with an `AggregateError` containing
all rejection reasons in input order.

## Concepts Exercised

- Promise combinator pattern — first-success / all-fail variant
- AggregateError built-in error type
- Indexed error collection for order preservation under concurrent rejection
- Empty array edge case inverts from Promise.all (rejects immediately, not resolves)

## My Approach

Same outer shell as B1 and B2: `new Promise` wrapper, fixed-size errors array,
`forEach` attaching observers. Key inversion: `.then` triggers immediate
resolution on first success; `.catch` increments a rejection counter and only
rejects when that counter reaches `promises.length`. No `.finally` needed —
the counter only belongs on the rejection path.

## Implementation Notes

- Empty array guard rejects immediately with `new AggregateError([], "All
promises were rejected")` — opposite of Promise.all and Promise.allSettled
  which resolve on empty.
- `AggregateError` takes two arguments: the errors array and a message string.
  Store raw Error objects, not `error.message` strings — callers testing
  `err.errors[0] instanceof Error` will catch the difference.
- No `.finally` — unlike Promise.allSettled, the counter only increments on
  rejection. Settlement count is irrelevant here.
- Multiple resolutions are harmless — once the outer promise resolves, further
  `resolve()` calls are no-ops. Same behavior as Promise.all's multiple
  `reject()` calls after the first.

## Lessons Learned

- Promise.any is the structural inverse of Promise.all: swap resolve and reject
  paths, swap the counter semantics, swap the empty array behavior.
- The inversion table across all four combinators is worth memorizing as a unit
  rather than each combinator independently.
- Reproduction priority: Medium. AggregateError and the empty array inversion
  are both non-obvious failure modes under pressure.

## Testing Strategy

- Empty array rejects immediately with AggregateError containing empty errors array
- Mixed promises: resolves with first settler's value (not first in input order)
- All rejecting: rejects with AggregateError, errors in input order
