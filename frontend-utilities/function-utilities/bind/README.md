# Function.prototype.bind Polyfill (A9)

## What Made This Hard

Three separate traps hit during Stage 1. First, guard provenance:
the thisArg guard from myCall/myApply looked like it belonged here
too, but it's an artifact of the Symbol-key technique — bind never
installs a property on thisArg, so the constraint doesn't apply.
Second, partial application required looking up a concrete example
to confirm that pre-bound args and call-time args merge into a
single argument list on every invocation. Third, the Symbol-key +
try/finally cleanup pattern doesn't transfer to bind because the
returned function may be invoked arbitrarily later — there's no
single install/cleanup lifecycle to manage.

## Key TypeScript Decisions

Arguments typed as `...args: unknown[]` (rest parameter) to capture
pre-bound args at bind time. The returned function uses a separate
rest parameter `...bindArgs: unknown[]` to distinguish call-time
args from pre-bound args at the type level. `this` typed as
`(...args: unknown[]) => unknown` to enforce that myBind is only
callable on functions.

## What Would Make a Second Attempt Faster

If returning a function: use closure to capture pre-bound args,
define a second rest parameter in the returned function for
call-time args, spread both lists at invocation via `this.apply`.
No Symbol key. No try/finally. Explicit binding via `.apply`
replaces implicit binding because there is no install/cleanup
lifecycle when invocation is deferred.

## Guard Provenance Lesson

Always ask why a guard exists before transplanting it to a
structurally similar problem. The thisArg object constraint in
myCall/myApply exists because the Symbol-key technique requires
assigning a property onto thisArg — primitives can't reliably hold
arbitrary properties. bind never touches thisArg directly, so that
constraint has no reason to exist here. The guard's origin
determines its scope.
