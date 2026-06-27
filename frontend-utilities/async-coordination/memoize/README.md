# Memoize

## Problem Statement

Implement a `memoize` function that caches the results of a function call. Given a function, return a new function that, when called with the same arguments, returns the cached result instead of recomputing it. Calls with different arguments should compute and cache independently.

## Concepts Exercised

- Closure — cache lives outside the returned function, closed over by it
- `this` binding — returned function must forward call-site context to the original
- TypeScript generics — `Parameters<F>` and `ReturnType<F>` for call-signature preservation
- `Map` as a typed cache structure
- `fn.apply` vs `fn.call` — semantic distinction when args is already an array

## My Approach

Close over a typed `Map` that maps serialized argument strings to precomputed results. Return a regular function (not an arrow) so `this` is set by the call site on each invocation. On each call, serialize args with `JSON.stringify`, check the cache, and either return the cached value or compute, store, and return.

## Implementation Notes

**Why a regular function, not an arrow:**
Arrow functions capture `this` from their lexical scope at definition time — in this case, whatever `this` is inside `memoize`, which is irrelevant and wrong. A regular function receives `this` fresh from the call site on each invocation. The `this` binding test (`multiplier.multiply(3)`) requires this behavior.

**Why `fn.apply(this, args)` over `fn.call(this, ...args)`:**
`args` is already an array from the rest parameter. `apply` takes an array directly — semantically correct, no unnecessary spread round-trip. Both produce identical behavior; `apply` communicates intent more clearly.

**Why non-null assertion on `cache.get(key)`:**
`Map.get()` returns `V | undefined` regardless of whether `cache.has(key)` was just checked. TypeScript does not narrow Map access based on `has()` guards. The assertion is semantically justified — you know the key is present because you just confirmed it.

**Why annotate the Map explicitly:**
`new Map()` without annotation infers `Map<any, any>`. Explicit annotation `Map<string, ReturnType<F>>` keeps the type honest and catches errors at the cache boundary rather than at callers.

**Key serialization limitation:**
`JSON.stringify` works correctly for primitive and plain object arguments. Known failure cases: functions (serialized as `undefined`), circular references (throws), class instances (loses prototype identity). Accepted limitation for interview scope.

## TypeScript Signature

```typescript
function memoize<F extends (...args: any[]) => any>(
  fn: F,
): (...args: Parameters<F>) => ReturnType<F>;
```

`F extends (...args: any[]) => any` is the call-site guard — callers passing non-functions get an error before the body runs. `Parameters<F>` and `ReturnType<F>` preserve the original function's full call signature.

## Final Implementation

```typescript
export function memoize<F extends (...args: any[]) => any>(
  fn: F,
): (...args: Parameters<F>) => ReturnType<F> {
  const cache = new Map<string, ReturnType<F>>();
  return function (this: unknown, ...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn.apply(this, args));
    }
    return cache.get(key) as ReturnType<F>;
  };
}
```

## Testing Strategy

- **Cache hit:** call counter inside original function stays at 1 after repeated calls with same arguments
- **Cache miss:** different arguments increment the call counter
- **Argument order:** `fn(1, 2)` and `fn(2, 1)` are distinct cache keys — counter increments
- **`this` binding:** memoize a method on an object, assert correct context forwarded to original

## Lessons Learned

What made this hard: forgetting to annotate the Map type — `new Map()` without annotation infers `Map<any, any>` and loses type safety at the cache boundary. The non-null assertion on `cache.get()` was non-trivial: TypeScript cannot statically narrow Map access based on a `has()` guard, same family as `Array.shift()` returning `T | undefined` despite a length check. The returned function must be a regular function expression, not an arrow — the syntax `return function(this: unknown, ...args) { ... }` is worth solidifying as muscle memory. Using `apply` over `call` when args is already an array is the semantically correct idiom.

**What would make a second cold attempt faster:** remembering the full model — typed Map, regular function return, `JSON.stringify` key, `fn.apply(this, args)`, non-null assertion at return. The anonymous regular function syntax is the one most likely to need a second to recall.

## Pattern Taxonomy Map Entry

**Pattern:** Memoization
**Cluster:** Async & Control Flow Patterns (Cluster 2)
