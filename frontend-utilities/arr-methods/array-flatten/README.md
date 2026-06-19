# A10 — Array Flatten

## Problem Statement

Implement `Array.prototype.myFlatten(depth?)` — a polyfill matching native
`Array.prototype.flat()`. Takes a nested array and returns a new array with
sub-array elements concatenated up to the specified depth. Default depth is
1. Must handle sparse arrays (holes removed, same as native `flat`/`map`/
`filter`) and `Infinity` as a depth value (fully flatten regardless of
nesting depth).

## Concepts Exercised

- Deep Recursive Traversal pattern (shared with deep clone, deep equal)
- Shared accumulator closed over by an inner recursive function
- Sparse array handling (`i in arr`)
- Construction-boundary typing (`unknown[]` internally, typed boundary at
  the outer signature)
- Boundary-condition precision: deciding exactly where a recursive
  condition should fire, not one step past it

## My Approach

Match phase: identified this as Deep Recursive Traversal, the same pattern
as deep clone and deep equal — recurse into nested structure, base case
at primitives, single accumulator shared across all recursive calls via
closure.

Where it diverges from deep clone: deep clone recurses unconditionally
into every nested object. Flatten's `depth` parameter makes the recursion
conditional — depth controls whether an encountered nested array gets
unwrapped (recursed into) or pushed whole as a single element.

Plan: outer function generic over `this: unknown[]` and `depth: number`,
inner recursive function closed over a shared `result` array, single loop
per call handling both primitive-push and array-recurse-or-push decisions
inline.

## Implementation Notes

The hardest part of this problem wasn't the recursion structure — that
transferred cleanly from deep clone and deep equal — it was correctly
modeling what the `depth` parameter actually controls.

My first attempt treated `depth === 0` as a classic early-return base
case, the same shape used in deep clone for primitives: hit the base
case, stop, return immediately. But depth-zero in flatten doesn't mean
"stop processing" — it means "still visit every element, just don't
unwrap arrays anymore." Conflating those two roles (stopping traversal
vs. controlling unwrap behavior) produced a version that needed an
artificial `depth + 1` compensation to pass tests, plus a separate
`if (depth === 1) push` branch that traced out to be unreachable dead
code for every real input except the depth-0 case — which the
compensation was itself faking.

A second alternative version (item-based recursion with a `depth < 0`
push check, rather than `depth > 0` deciding recurse) also passed every
test, but required the recursion to overshoot one full frame past the
semantic boundary before self-correcting — depth has to go negative
before the function notices it should have stopped. Functionally
equivalent output, but structurally worse: it does one unnecessary
recursive call per boundary crossing, and "why does this need to go
negative to terminate" has no good answer in a code review.

The version that shipped: a single `if (depth > 0) recurse else push`
check, made inline at the point where a nested array is encountered.
No early-return base case on depth, no offset, no special-casing. The
push-or-recurse decision fires exactly where the semantic threshold is.

**General debugging lesson, worth carrying forward:** when an
implementation needs a compensating offset (here, `depth + 1`) to make
two pieces of logic agree, that's usually a sign the two pieces were
never actually separate cases — collapse them rather than patch around
the seam. This showed up twice in this session in two different shapes
(missing-else requiring `+1` compensation; loose `<` boundary requiring
one extra overshoot frame) — same root cause, different surface.

**TypeScript decisions:** the recursive inner function is typed
`unknown[]` for its array parameter, narrowed internally with
`Array.isArray`. This is the same construction-boundary pattern used in
deep clone — dynamic/untyped handling during traversal, typed signature
only at the outer boundary. The outer function's return type is
currently `unknown[]` rather than generic over the input element type;
preserving element types through arbitrary nesting depth requires a
recursive conditional type (native `flat()` uses `FlatArray<Arr, Depth>`
internally for this). Deliberately deferred — flagged as a strong,
concrete first example for when conditional types/`infer` activate as a
retrieval cluster in Phase 3.

**What would make a second attempt faster:** lead with the question
"does depth represent a stop condition or a per-node behavioral switch?"
before writing any code. For Deep Recursive Traversal problems generally,
ask explicitly whether the recursion's terminating condition is a true
base case (nothing more to do, return) or a decision point (something
must still happen at this node, the only question is which branch).

## Testing Strategy

Behavioral assertions, not smoke tests, matching prior GFE problems:

- Flat input array, no nesting (sanity check, depth irrelevant)
- `depth(0)` on a nested array — must return unchanged, no unwrapping
- Default depth (no argument) on one level of nesting — unwraps exactly
  one level
- Mixed primitive types alongside nesting
- `depth(2)` on input nested exactly 2 levels deep
- `depth(Infinity)` on the same input — fully flattens regardless of
  actual depth
- Sparse array — holes removed, consistent with native `flat`/`map`/
  `filter` behavior

All 8 assertions passing against the final implementation.

## Lessons Learned

The surface pattern (recursion + base case) transferred correctly from
deep clone, but the deep structure didn't — hitting a primitive in deep
clone genuinely is "nothing more to do here," while hitting depth-zero
in flatten is "still do the normal per-node work, just choose the other
branch." Pattern-matching on the shape of a prior solution without
checking whether the underlying semantics actually match is a specific
failure mode worth watching for on future Deep Recursive Traversal
problems — especially in Phase 2/3 when new traversal-flavored problems
show up under time pressure and the temptation is to reach for the
nearest-looking prior solution rather than re-deriving what the
termination condition actually means in the new context.