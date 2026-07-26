# B8: Curry (Partial Application)

## Problem Statement

Implement `myCurry(fn)` — a function that accepts a function `fn` and
returns a new function which accepts arguments incrementally across
multiple calls. Once enough arguments have been provided to satisfy
`fn`'s arity, the original function executes with the accumulated
arguments and returns the result. Until then, calling the returned
function with more arguments returns another function that continues
to accept the remaining arguments — in any grouping (one at a time,
several at once, or all at once).

## Concepts Exercised

- Recursive conditional types with `infer` (tuple pattern matching)
- Distributive vs. non-distributive tuple destructuring
- `Parameters<Fn>` / `ReturnType<Fn>` as the type-level source of arity
- `Function.prototype.length` as the runtime source of arity
- Closure factory pattern (new first-encounter concept — see PTM)
- Construction-boundary typing (`any` internally, single assertion at
  the return boundary) — third confirmed instance of this pattern,
  after Deep Clone/Deep Equal and Promisify

## My Approach

Type derived first (S47, verbal/desk, UMP complete): a recursive
conditional type `Curried<Fn, Provided>` matches `Parameters<Fn>`
against `[...Provided, ...infer Remaining]`. If `Remaining` is `[]`,
resolve to `ReturnType<Fn>`. Otherwise, resolve to a function type
that accepts `NextArgs` and recurses as
`Curried<Fn, [...Provided, ...NextArgs]>`.

Runtime implementation (S48, desk): initial attempt used one
persistent closure over a single mutable `providedArgs` array,
directly mirroring the debounce/memoize/singleton pattern. This was
wrong — it caused cross-contamination between independent partial
applications of the same curried function (see Implementation Notes).
Corrected to a closure **factory**: an inner `makeCurried(soFar)`
function that takes the accumulated arguments as a parameter and
returns a function closing over that specific snapshot. Each call to
`makeCurried` mints an independent closure, so branching partial
applications (e.g. `double(2)` then `double(4)` on the same `double`)
no longer share state.

## Implementation Notes

**The bug and the fix:** the first working-code attempt declared
`providedArgs` once, outside the returned function, and mutated it in
place on every call (`providedArgs = [...providedArgs, ...nextArgs]`).
This works for a _single_ call chain but breaks the moment the same
partial application is called more than once with different follow-up
arguments — e.g. calling `double(2)` and later `double(4)` on the same
`double` reused both accumulate onto the _same_ shared array, so the
second call sees contaminated state from the first
(`[2, 2]` → `[2, 2, 4]`, never satisfying arity again). Diagnosed via
hand-trace, connected explicitly to a LeetCode backtracking analogy
(shared mutable state across branches that should be independent) —
though the actual fix here is "never share the structure" rather than
backtracking's "mutate then undo."

**The fix:** restructure so the function that does the real work
(`makeCurried`) takes the accumulated-so-far array as an explicit
parameter rather than closing over a single outer variable. Each
recursive call — `makeCurried(combinedArgs)` — constructs a _new_
function with its _own_ closure over that call's specific
`combinedArgs`. `myCurry` itself is just the zero-argument entry
point: `return makeCurried([])`.

**Typing the factory:** the recursive conditional type
`Curried<Fn, Provided>` cannot be resolved by the compiler against
dynamically-shaped runtime code — conditional types need to fully
resolve before structural checks can run, and the compiler can't
verify an arbitrary runtime closure against an unresolved condition.
Fix: type `makeCurried`'s internals loosely (effectively `any`)
and apply exactly **one** type assertion (`as Curried<Fn, []>`) at
the single point where `myCurry` returns the fully-built factory
output to the outside world. Scattering casts at each internal
`return` (tried first) does not work — each individual return is
still being checked locally against the same unresolvable
conditional. This is the same construction-boundary idiom used in
Deep Clone/Deep Equal (`any` during traversal, typed assertion at
return) and Promisify (loosely-typed callback body, typed function
signature at the boundary) — third confirmed occurrence, worth
treating as a general principle rather than three coincidences.

**`Function.prototype.length` for runtime arity:** `Parameters<Fn>`
gives arity at the type level; `fn.length` is its runtime mirror —
the count of a function's declared, non-default, non-rest parameters,
fixed at definition time. Does not update as arguments accumulate;
the arity check compares `providedArgs.length` (accumulating) against
`fn.length` (fixed), not the other way around. New retrieval item —
not previously needed in Blocks A or earlier B problems, which had no
runtime arity-introspection requirement.

**Named limitation, confirmed at the value level (not just typed):**
`NextArgs extends any[]` (and, more precisely in this implementation,
`Fn extends (...args: any[]) => any` erasing `Parameters<Fn>`
structure once inside `makeCurried`) does not produce a compile error
when too many or wrong-typed arguments are supplied. Tested directly:
`curriedMultiply(1, 2, 3)` against a 2-arity function returns _another
callable function_ — no crash, no thrown error, `fn.length ===
combinedArgs.length` simply never becomes true again since
`combinedArgs.length` only grows from 3 upward. This is a silent
runtime dead-end, arguably worse than a loud failure, since the
returned object looks like a normal function from the outside. Real
fix (per S47) requires a dedicated recursive "valid prefix of
Remaining" constraint type, not attempted here — deferred, named
honestly rather than silently carried.

**False-friend caught and rejected:** the fluent chaining call shape
(`x(a)(b)(c)`) superficially resembles the classic Builder pattern
(`new Builder().add(a).add(b).build()`), but they are architecturally
opposite. Builder mutates one shared object and returns `this` by
reference on every call — same family as debounce/memoize/singleton's
single-persistent-instance model. Curry's closure factory shares
nothing and constructs a fresh independent closure at every call.
Confirmed via a transfer test (path-builder scenario, worked
verbally, commute mode, no code) that the branch-independence
requirement (`usersA` vs `usersB` not contaminating each other) holds
under the factory model and would NOT hold under classic Builder
mutation.

## Testing Strategy

- Basic curry over a multi-argument function, called one arg at a
  time (`double(2)`, `double(4)` — reused, not fresh calls to
  `curriedMultiply` — this specifically exercises branch isolation).
- All-args-at-once call (`multiplyAll(2, 3)`).
- Grouped/mixed calls (`multiplyAll(2)(3)`).
- Different argument types (string + number, via `printLabel`).
- Too-many-args edge case: confirms silent dead-end behavior (see
  Named Limitation above) rather than a crash — documents the known
  gap as an explicit test case rather than an unhandled edge.
