# Promise Queue

A concurrency-limited async task runner built from scratch as part of a 
structured JavaScript fundamentals curriculum.

## Problem
Write a function that accepts an array of async tasks and a concurrency limit, 
running at most N tasks simultaneously and resolving with all results in original 
task order.

## Approach
The naive approach is batching — split tasks into groups of N and await each 
group sequentially with Promise.all. This is wrong. The slowest task in each 
batch blocks the entire group, leaving worker slots idle while they wait.

The correct approach is worker chaining. Spin up N workers at the start. Each 
worker pulls the next task from a shared queue the moment it finishes, keeping 
every slot occupied until the queue is drained. Promise.all wraps the workers, 
not the tasks.

## Key Design Decisions

**Tasks as factories, not promises** — tasks are passed as functions that return 
promises rather than raw promises. A promise starts executing the moment it is 
created. Wrapping each task in a factory gives the queue control over when 
execution starts.

**Precomputed index tuples** — each task is paired with its original array index 
before any workers start. A shared mutable counter would work in theory but 
introduces state that needs to stay in sync across workers. Tuples make the 
index immutable and co-located with the task — no counter, no drift.

**Closure over shared references** — the task queue and result array are closed 
over by every worker. Because both are reference types, every worker reads and 
mutates the same objects in memory without needing them passed as arguments. 
This is intentional — the closure is load-bearing, not incidental.

**Fail-fast behavior** — a rejected task propagates immediately to Promise.all, 
which rejects the outer promise without waiting for remaining tasks. Limitation: 
in-flight tasks are not cancelled. JavaScript promises have no cancellation 
primitive — tasks already running will complete silently in the background and 
continue mutating the result array even after rejection. An AbortController 
would be required for true cancellation.

**Mutation-during-iteration bug** — an early version computed the initial worker 
count with Math.min(concurrency, taskQueue.length) evaluated on each loop 
iteration. Because shift mutates taskQueue inside the loop, the length shrinks 
as the loop runs, causing it to exit early. Fixed by computing workerCount once 
before the loop. This bug was caught by the concurrency assertion in the test 
suite, not by visual inspection.

## Testing Strategy
The test suite asserts behavior, not just output values. A shared active counter 
increments when each task starts and decrements when it finishes. Peak active 
value is asserted against the concurrency limit after each test — this proves 
the concurrency constraint was mechanically respected, not just that the results 
look correct.

Tests run sequentially with explicit tracker resets between each case to ensure 
order independence.

## Concepts Practiced
- Closures and closure over reference types vs primitives
- Promise coordination — Promise.all, fail-fast vs settle-all
- Async/await and sequential async chaining
- Factory function pattern for deferred execution
- Error handling and propagation
- Mutation-during-iteration as a class of bug