# B7 — Promisify

## Problem Statement

Create a function that takes in a callback-based API and returns
that function wrapped by a Promise, terminating with the result or
error of the function through the callback.

Signature target: `promisify(fn)` returns a new function which,
when called with the "real" arguments, returns a Promise that
resolves or rejects based on how `fn`'s Node-style
`(err, data)` callback eventually fires.

## My Approach

`promisify` is a two-layer construct. Layer 1: calling `promisify(fn)`
returns a new function — not a Promise. The Promise doesn't exist
yet at this point. Layer 2: calling that returned function invokes
`fn` and returns a Promise that resolves with `fn`'s eventually-
delivered callback result.

The returned function takes in the original arguments and returns a
Promise. Inside the Promise constructor, the callback the underlying
API will eventually invoke gets defined — it decides how the Promise
resolves or rejects. `fn` is then called via `.apply`, inheriting
`this` implicitly, with the original arguments spread together with
this constructed callback into a single array.

The hard part, initially: understanding that `promisify` has to
construct its own callback — that `fn` doesn't come with one, and
that the callback's entire job is to be the bridge between `fn`'s
"I'm done" signal and the Promise's `resolve`/`reject`. This wasn't
obvious going in. It clicked once traced through concretely:
`resolve` and `reject` only exist as parameters inside the Promise
executor — nowhere else in the program can a function reach them —
so any function that's eventually going to call `resolve`/`reject`
has to be *defined* inside that executor, as a closure over those
two specific values. `fn` itself never knows it's touching a Promise
at all; from its perspective it's just being handed an ordinary
Node-style callback, identical to what it'd get from any other
caller.

Extends the existing Promisification pattern (S22, `setTimeout`
delay mechanism) rather than creating a new PTM entry — the core
resolve/reject mechanism is unchanged. The new piece is the
higher-order wrapping layer: `promisify` produces a reusable
promisified version of an entire function, rather than wrapping one
single inline call.

## Implementation Notes / Lessons Learned

**Signature derivation (locked S45, implemented S46):**
```typescript
function promisify<T extends any[], R>(
  fn: (...allArgs: [...T, Callback<R>]) => any,
): (...args: T) => Promise<R>
```
`T extends any[]` represents the "real" arguments — everything
before the Node-style callback. The callback's shape is written
inline in the tuple (`Callback<R>`) rather than pulled out as its
own generic, since the shape is fixed and known. TypeScript allows
only one rest parameter per parameter list, and it must be final —
confirmed experientially (TS1014) when a two-separate-parameter
attempt was tried first. A tuple type containing a spread
(`[...T, Callback<R>]`) is the escape hatch: it expresses "many
things, then one more specific thing" at the type level while the
parameter list itself stays a single rest parameter.

**Bugs caught and self-corrected during the build, in order:**

1. **Syntax — mixed function/arrow declaration.** First draft of the
   returned function mixed `function (...)` syntax with `=>`, and
   was missing the `...` on the rest parameter entirely. Corrected
   to `function (this: unknown, ...args: T): Promise<R> { ... }`,
   matching the S45 verbal plan exactly.

2. **Test harness importing the wrong `promisify`.** The test file's
   first draft imported `promisify` from Node's built-in `util`
   module instead of the local implementation — meaning every test
   run up to that point would have validated Node's `util.promisify`,
   not my own code, and passed for entirely the wrong reason. Caught
   by tracing what the import statement actually pointed to. Fixed
   to `import { promisify, Callback } from "../src/promisify"`.

3. **`Error | null` vs `data?: T` — callback typing.** Node's
   error-first convention signals "no error" with `null`, not
   `undefined`. Reasoning: `undefined` means a value was never set;
   `null` means a value was deliberately assigned to signal absence.
   Node's convention checks explicitly and reports `null` on
   success — the deliberate-signal category, not the never-set one.
   For the `data` parameter, `data?: T` (optional parameter) was the
   right choice over `data: T | undefined` — the former lets a
   caller omit the second argument entirely on the error path
   (`callback(err)`), while the latter would force `callback(err,
   undefined)` explicitly at every such call site for no benefit.
   Final type:
```typescript
   type Callback<T> = (err: Error | null, data?: T) => void;
```
   Noted limitation: `data?: T` inside the callback body still
   leaves `data` typed as possibly-undefined even when `err` is
   `null` — TypeScript can't infer the correlation between the two
   independently-typed fields. A discriminated union
   (`{ ok: true; data: T } | { ok: false; error: Error }`) is the
   production-grade fix for this, used when API ergonomics actually
   matter, but out of scope for B7 since the goal here is wrapping
   Node's real convention, not improving on it.

4. **Falsy-data resolve bug.** Initial resolve/reject branch used
   `else if (data)` to decide whether to resolve — which would
   incorrectly treat any falsy-but-valid resolved value (`0`, `""`,
   `false`) as "no data" and fall through to a reject branch instead.
   Self-corrected to `data !== undefined`, and added a defensive
   final `else` branch that explicitly rejects if a callback somehow
   fires with neither an error nor data — prevents a permanently-
   pending Promise in that edge case.

5. **Fixture bug — missing `setTimeout` delay.** The `undefDelay`
   test fixture's `setTimeout` call initially omitted its `ms`
   argument, meaning it would fire on the next tick regardless of
   the value passed in — the test would have passed, but not because
   the timing logic was actually correct. Self-caught and fixed.

**What would make round two faster:** the two genuinely new pieces
were the `Callback<T>` type definition itself and the rest-parameter-
as-spread-tuple typing technique (`[...T, Callback<R>]`). Both are
now derived once and documented — a cold Stage 2 reproduction should
be substantially faster with these already known rather than
re-derived from three wrong attempts (as happened during the S45
UMP planning phase).

## Testing Strategy

Three fixtures, each exercising a distinct branch:
- `delay` — success path, resolves with a string after a real delay.
- `errDelay` — error path, rejects with a real `Error` after a delay.
- `undefDelay` — added beyond the original plan; exercises the
  falsy/undefined-data branch specifically, asserting the promisified
  function rejects rather than silently resolving with `undefined`.

All three fire asynchronously via `setTimeout` rather than
synchronously, deliberately — this is what actually exercises the
Frame 1 (registration) / Frame 2 (invocation) boundary that
`promisify`'s Promise-wrapping logic depends on. A synchronous fixture
could pass even with a broken wrapper, since there'd be no real event
loop turn to expose the bug.