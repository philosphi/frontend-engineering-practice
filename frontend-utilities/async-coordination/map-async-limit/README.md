# Map Async Limit

## Problem Statement

Implement a `mapAsyncLimit` function that applies an async callback to each item in an array, but with at most `limit` operations running in parallel at any time. Results must be returned in the same order as the input array regardless of settlement order. Rejects immediately if any callback rejects. Throws a `RangeError` if `limit` is less than 1.

## Concepts Exercised

- Worker-chaining concurrency model
- Promise coordination — `Promise.all` wrapping workers, not tasks
- Result order preservation via indexed assignment
- TypeScript generics — two-generic signature separating item type from return type
- Non-null assertion — `Array.shift()` always returns `T | undefined` regardless of length check
- `await` in recursive calls — load-bearing for chain drainage

## My Approach

Precompute a queue of `{ item, index }` tuples. Spin up `Math.min(limit, items.length)` workers immediately. Each worker calls `fn(item)`, stores the result at the original index, then pulls the next item from the queue and recurses. `Promise.all` wraps the initial worker pool — it waits for all chains to drain and propagates any rejection fail-fast.

## Implementation Notes

**Why `Math.min(limit, items.length)` instead of a guard:**
When concurrency exceeds item count, `Math.min` caps the initial pool naturally. An empty array produces a pool size of 0, the for loop runs zero iterations, and `Promise.all([])` resolves immediately with `[]`. No explicit empty array guard needed — the math handles it.

**Why `await run(nextItem, nextIndex)` inside the recursive call is load-bearing:**
Without `await`, the worker fires the recursive call and returns immediately. Its promise resolves after the first task only. `Promise.all` sees early resolution and returns a partially filled results array. The `await` is what makes the chain a chain rather than fire-and-forget.

**What `Promise.all` is doing here:**
Two jobs: (1) holds the `await` until all worker chains have fully drained including all recursive tails — without it, `results` is returned before any work completes; (2) propagates any rejection fail-fast to the caller.

**Why no try/catch in the worker:**
An unhandled throw inside an `async` function causes that function's returned promise to reject automatically. A try/catch that only rethrows is dead code. `Promise.all` catches the rejection and propagates it.

**Why `workerQueue.shift()!` requires a non-null assertion:**
`Array.shift()` always returns `T | undefined` regardless of any length check. TypeScript does not narrow array contents based on `if (array.length > 0)` guards. Same family as `Map.get()` returning `V | undefined` after `has()`. The assertion is semantically justified — you only call `shift()` after confirming the queue is non-empty.

**Why the callback is typed as `(item: T) => Promise<R>` and not `T extends (...args: any[]) => any`:**
The callback always takes exactly one item. The two-generic approach (`T` for item type, `R` for resolved return type) is cleaner and more expressive. The `Parameters<T>[]` approach would make each item a tuple of all arguments — wrong shape for this API.

**Why in-flight promises are not cancelled on rejection:**
JavaScript has no cancellation primitive. When a worker rejects and `Promise.all` rejects the outer promise, other workers finish what they're already executing. Their results are ignored.

## TypeScript Signature

```typescript
function mapAsyncLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit: number,
): Promise<R[]>;
```

Two generics: `T` for item type, `R` for resolved return type. Callback typed as `(item: T) => Promise<R>` — not a generic function type. Return type is `Promise<R[]>`, not `Promise<Awaited<R>[]>`, because `R` is already the resolved type.

## Final Implementation

```typescript
export async function mapAsyncLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit: number,
): Promise<R[]> {
  if (limit < 1) {
    throw RangeError("limit must be greater than 0");
  }
  const results: R[] = new Array(items.length);
  const workerQueue = items.map((item, index) => ({ item, index }));

  async function run(item: T, index: number) {
    const result = await fn(item);
    results[index] = result;
    if (workerQueue.length) {
      const { item: nextItem, index: nextIndex } = workerQueue.shift()!;
      await run(nextItem, nextIndex);
    }
  }

  const workerPool: Promise<void>[] = [];
  const workerPoolSize = Math.min(limit, items.length);
  for (let i = 0; i < workerPoolSize; i++) {
    const { item: nextItem, index: nextIndex } = workerQueue.shift()!;
    workerPool.push(run(nextItem, nextIndex));
  }

  await Promise.all(workerPool);
  return results;
}
```

## Testing Strategy

- **Empty array:** resolves immediately with `[]`, peak concurrency stays 0
- **Order preservation:** items with varying delays resolve in input order regardless of settlement order
- **Fail-fast rejection:** one failing item rejects the outer promise; peak concurrency matches limit
- **Concurrency greater than tasks:** all items fire immediately, peak equals item count not limit

## Lessons Learned

What made this hard: knowing when to use `await` — specifically that `await run(nextItem, nextIndex)` inside the recursive call is load-bearing. Without it the worker resolves after its first task and the chain doesn't drain. This is a common async/await precision trap: firing an async function without awaiting it means the caller resolves before the callee completes.

The other non-trivial piece was remembering the full model: a workerPool of in-flight promises (not factories), `Promise.all` wrapping the pool (not the tasks), workers chaining to the next item on completion. The distinction from Promise combinators — input is not yet in flight, deferred execution is controlled by calling `fn(item)` inside the worker — is the most important recognition cue.

**Improvements identified over earlier promiseQueue implementation:**

- No `tasks.length` guard — `Math.min` handles empty arrays naturally
- No try/catch dead code — async throws propagate automatically
- No slotting error into results — wrong behavior, error should reject the outer promise
- No factory wrapper on workerPool — workers start immediately, push promise directly

**What would make a second cold attempt faster:** internalizing the full mental model before writing any code — workerPool wraps workers not tasks, `await` on the recursive call is load-bearing, `Math.min` eliminates the need for any guard. The TypeScript signature (two generics, callback typed as `(item: T) => Promise<R>`) should fire automatically from the recognition cue.

## Comparison to promiseQueue

| Dimension          | promiseQueue                              | mapAsyncLimit                    |
| ------------------ | ----------------------------------------- | -------------------------------- |
| Input              | Array of factory functions                | Array of items + single callback |
| Deferred execution | Stored as factory, called in worker       | `fn(item)` called inside worker  |
| Empty array guard  | Explicit guard required                   | `Math.min` handles naturally     |
| Error handling     | try/catch (dead code) + slot into results | No try/catch, throw propagates   |
| Worker pool push   | Factory wrapper `() => run(...)`          | Promise pushed directly          |

## Pattern Taxonomy Map Entry

**Pattern:** Async Task Queue / Concurrency Control (mapAsyncLimit variant)
**Cluster:** Async & Control Flow Patterns (Cluster 2)
