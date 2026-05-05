# Async Retry Utility

## Problem Statement

A utility function that wraps any asynchronous function and automatically retries it upon failure. Accepts a maximum retry count and a base delay, and implements exponential backoff between attempts — each retry waits progressively longer before executing. If the wrapped function succeeds on any attempt, the result is returned immediately. If all retries are exhausted, the utility rejects with the last error encountered. Designed for any async operation subject to transient failure: network requests, database connection acquisition, WebSocket reconnection, rate-limited API calls.

---

## Concepts Exercised

- **Closure-based state preservation.** The recursive `attempt` function closes over `retryCount`, `maxRetries`, and the shared delay iterator. These bindings live on the heap across recursive invocations without being passed as arguments — the closure keeps them alive and accessible across the entire retry chain.

- **Generators and iterators.** A generator function produces an infinite lazy sequence of exponentially increasing delay values. The generator suspends at each `yield`, preserving its internal state — the current multiplier — until `.next()` is called again. This produces values on demand rather than pre-computing a list, which is the appropriate tool for a potentially infinite sequence.

- **Promisification.** `setTimeout` is a callback-based API — it hands work to the browser and its return value is a timer ID, not a promise. To make the delay `await`-able, `setTimeout` is wrapped in a `new Promise` whose `resolve` is passed directly as the callback. When the timer fires, it calls `resolve()`, settling the promise and allowing execution to resume. This is the standard pattern for converting callback-based APIs into promise-based ones.

- **Try/catch for async error handling.** `await` surfaces rejected promises as thrown errors inside the current stack frame, making synchronous error control flow work for async code. The `catch` block is the decision point: throw the error if retries are exhausted, otherwise pause and recurse.

- **`return await` over bare `return`.** Each recursive `attempt` call uses `return await` rather than a bare `return`. This keeps the current stack frame alive until the returned promise settles. Under failure, every frame in the retry chain appears in the stack trace — making it possible to see exactly which attempt failed and how deep the chain was at that point.

---

## My Approach

- **Recursive inner function over iterative loop.** A recursive structure came naturally here and maps cleanly onto the retry mental model: attempt, fail, attempt again. Each invocation is a self-contained unit of work. `return await` at each recursion level also preserves the full call chain in stack traces — a legitimate engineering argument beyond readability. The iterative equivalent would use a `while` loop conditioned on retry count, which is viable but loses the frame-by-frame traceability.

- **Shared iterator defined outside the recursive function.** The delay generator is instantiated once in the outer scope and closed over by `attempt`. If it were instantiated inside `attempt`, each invocation would create a fresh generator, always yielding the first value. A single shared iterator advances through the sequence correctly across all recursive calls.

- **Prebind contract over argument forwarding.** `withRetry` accepts a zero-argument function. Any arguments the wrapped function needs are the caller's responsibility to bind — either via a closure or `.bind()`. This keeps the `withRetry` signature clean and avoids the awkward pattern of placing arguments after a configuration object. The tradeoff is documented: the caller owns argument binding.

- **`>=` guard on retry count.** The exhaustion check uses `retryCount >= maxRetries` rather than strict equality. This is defensive — invalid inputs like negative numbers or decimals cannot cause the guard to be silently skipped, which would produce an infinite retry loop.

- **API contract — `maxRetries` means retries, not total executions.** `maxRetries: 3` produces up to 4 total executions: one initial attempt plus three retries. This matches the convention used by production retry libraries. Documented explicitly to avoid off-by-one confusion at the call site.

---

## Testing Strategy

Tests use Node's built-in `assert` module with a custom `asyncTest` helper that accepts an async function and an expected result, awaiting the function and asserting with `assert.strictEqual`. Each test case isolates a distinct behavior:

- Function succeeds on first attempt — no retries occur
- Function fails once then succeeds — retry fires, result returned
- Function exhausts all retries — rejects with last error
- Exponential backoff sequence — delays verified as `>= expectedDelay` rather than strict equality, since timer execution introduces real-world overhead that makes exact matching unreliable

---

## Known Limitations

- **No jitter.** Pure exponential backoff causes a thundering herd problem in production: if many clients fail simultaneously and share the same backoff schedule, they all retry at the same moment and hammer the server again in lockstep. The fix is adding randomness — `delay * Math.random()` — to spread retries across a window. This is called full jitter and is the approach recommended by AWS for distributed systems.

- **No cancellation.** JavaScript promises have no cancellation primitive. In-flight attempts cannot be aborted if the caller decides to give up early.

- **Soft encapsulation.** Internal state — `retryCount`, the delay iterator — is protected by closure, not by class field visibility. This is hard encapsulation: there is no way for the caller to reach into the retry chain and inspect or mutate internal state.

---

## Lessons Learned

- **Generators as lazy stateful sequences.** A generator doesn't compute a list — it suspends at each `yield` and restores its entire local context on the next `.next()` call. This makes it the right tool for infinite sequences where values should be produced on demand. Pre-computing an array of delay values would work, but it forces an upfront decision about sequence length. The generator defers that entirely.

- **Promisification — wrapping callback APIs.** `setTimeout` returns a timer ID, not a promise, so it cannot be `await`-ed directly. Wrapping it in `new Promise` and passing `resolve` as the callback converts it into something the async runtime can schedule correctly. This pattern — promisification — applies to any callback-based API: Node-style `fs` methods, browser APIs, third-party SDKs. Node's `util.promisify` automates it for Node-style callbacks.

- **The `await` suspension chain.** `await` doesn't just pause one function — it suspends the entire chain of async callers upward. Each outer async function that was awaiting the one below it also suspends and removes its frame from the call stack. This cooperative unwinding is how the call stack empties, which is what allows the event loop to pick up the next task. Without this chain of suspensions, the browser's `setTimeout` callback could never get a turn on the stack.
