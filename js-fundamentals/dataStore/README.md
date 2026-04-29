# Module-Based Data Store

## Problem Statement

A data store that manages records as key-value pairs, where the key is a record
ID and the value is the record data object. The store is exported as a singleton
— any file that imports it receives the same shared instance, so mutations are
reflected across all importers without manual coordination.

The store exposes a controlled public API: `get(id)` to retrieve a record,
`set(id, record)` to create or update a record, and `delete(id)` to remove one.
It also supports event-driven observation via `on(event, listener)` and
`off(event, listener)`, firing `create`, `update`, and `delete` events as
operations occur. Event handling is powered by the EventEmitter built in the
previous project.

---

## Concepts Exercised

**Map as a data structure** — Records are stored in a `Map` rather than a plain
object. Plain objects call `.toString()` on all keys, which collapses any object
reference keys into `"[object Object]"` — corrupting lookups. `Map` preserves
reference identity, guarantees insertion order, and exposes a clean API
(`.has()`, `.get()`, `.set()`, `.delete()`) with O(1) lookup.

**Closure-based state preservation** — The `records` Map and `emitter` instance
are initialized in the constructor and live on the heap. All class methods close
over `this`, maintaining a reference to that heap-resident state without needing
to pass it as arguments. This is the same mechanism underlying the Promise Queue
and EventEmitter projects.

**ES Modules and module caching (Singleton)** — The module system maintains an
internal registry mapping each resolved file path to its evaluated module record.
On first import, the module executes and its export is stored in the registry.
Every subsequent import returns the cached export object — the module never
re-executes. Exporting `new Store()` as the default export guarantees a single
instance is initialized once and shared across all importers.

**Composition over inheritance** — `Store` has-a `EventEmitter` rather than
is-a `EventEmitter`. The relationship is behavioral reuse, not type hierarchy.
`Store` is not an event emitter — it is a data store that uses one internally.
Composition keeps the abstraction clean and avoids inheriting the full
`EventEmitter` surface area as part of the store's public contract.

**Encapsulation via controlled API surface** — The emitter is held privately on
`this.emitter`. Consumers interact with it exclusively through `store.on()` and
`store.off()`. Direct access to `this.emitter.emit()` is intentionally
unavailable, preventing consumers from bypassing the API contract and firing
arbitrary events. Note: JavaScript class fields are soft-private — a determined
consumer can still access `store.emitter` directly. True hard encapsulation
requires either closure-based design or private class fields (`#emitter`).

**Observer pattern** — Consumers register named listeners via `on()` that fire
synchronously when the store emits a corresponding event, allowing decoupled
reaction to state changes without polling. The store is the Subject; the
listeners are the Observers.

**Frozen enum object** — `StoreEvent` is a plain object frozen with
`Object.freeze()`. This prevents consumers from mutating the event name
constants, ensuring the guard logic in `on()` and `off()` operates against a
stable, immutable set of valid event names.

---

## Approach

`Store` is a class that composes an `EventEmitter` internally rather than
extending it, because the store has-a emitter relationship — not an is-a one.
Extending `EventEmitter` would expose the full emitter API as part of the
store's public surface, which would allow consumers to call `store.emit()`
directly and bypass the store's own event contract. Composition keeps the
boundaries clean.

The store is exported as a singleton (`export default new Store()`) rather than
exporting the class itself, because only one instance should exist for the
lifetime of the application. If the class were exported, each importer could
instantiate its own copy — leading to silent state divergence where mutations
in one file are invisible to another. The module caching mechanism enforces this
guarantee at the language level: the constructor runs exactly once.

---

## Implementation Notes

**`remove` vs `delete` naming** — The original UMP used `remove` as the event
name, matching the EventEmitter convention. During implementation this was
changed to `delete` for consistency with the `Map` API (`.delete()`). The
naming must be consistent across the `StoreEvent` enum, the class method, and
any documentation — a mismatch here causes silent failures (the guard logs
"Event not supported") or hard TypeErrors (calling `store.remove()` throws
because the method doesn't exist).

**`Object.freeze` omitted initially** — `StoreEvent` was defined as a plain
object without `Object.freeze()` in the first pass. Without it, any consumer
can add or overwrite event name constants, breaking the guard logic silently.
Added in revision.

**`get()` added mid-build** — `get()` was not in the UMP design but was added
during implementation as a natural extension of the API. Read access does not
bypass the encapsulation contract the way direct emitter access would. It is a
neutral addition, but it was an undocumented mid-build decision. Lesson: note
API additions in the plan before implementing them, even when they seem obvious.

**Emit ordering** — `set()` emits after writing to the Map, not before. This
guarantees that any listener querying back into the store via `store.get()` sees
consistent, up-to-date state. Emitting before the write would cause listeners
to read stale data. `delete()` also emits after deletion — the payload is the
`id` only, because the record is already gone by the time listeners fire.

**`Object.hasOwn` vs `in` operator** — The event guard was initially written as
`event in StoreEvent`. The `in` operator walks the prototype chain, meaning
`"toString" in StoreEvent` returns `true` even though `toString` is not a valid
event. `Object.hasOwn(StoreEvent, event)` checks own properties only — the
semantically correct check for "is this a registered event name."

**`set()` refactor** — The initial implementation duplicated `this.records.set()`
in both branches of the create/update conditional. Refactored to check
`records.has()` first, write unconditionally, then emit via a ternary:

```javascript
const isExistingRecord = this.records.has(id);
this.records.set(id, record);
this.emitter.emit(
  isExistingRecord ? StoreEvent.update : StoreEvent.create,
  id,
  record,
);
```

**Soft encapsulation limitation** — JavaScript class fields are publicly
accessible. `store.emitter` and `store.records` are reachable by any consumer.
True hard encapsulation would require closure-based design (no class) or private
class fields (`#records`, `#emitter`). This is a known tradeoff of the
class-based approach documented here for future reference.

---

## Testing Strategy

Tests use Node's built-in `assert` module with `strictEqual` for primitive
assertions. Each test block resets state via `store.clear()` — which
reinitializes both `this.records` and `this.emitter` to fresh instances,
severing all references to prior state and allowing GC to reclaim it.

Behavioral assertion pattern: a counter variable in outer scope, incremented by
the listener. Two assertions per behavior — one proving the positive case
(listener fired), one proving the negative case (listener did not fire when it
should not have). The second assertion is the one that actually proves
`off()` or discrimination logic worked.

**Test cases covered:**

- **Create discrimination** — `set()` on a new ID fires `create`, not `update`
- **Update discrimination** — `set()` on an existing ID fires `update`, not `create`
- **Listener deregistration** — `off()` prevents listener from firing on subsequent operations
- **Delete** — `delete()` fires the `delete` event and removes the record from the Map
- **`get()` after delete** — returns `undefined` for a deleted record
- **Unsupported event guard** — `on()` with an invalid event name does not register the listener; count remains 0

**Test isolation tradeoff:** The store is a singleton — there is no fresh
instance per test. `clear()` is a test utility method added specifically to
reset internal state. This is a pragmatic solution that leaks test concerns into
the implementation. The alternative — exporting the `Store` class alongside the
singleton — would allow tests to instantiate fresh instances without modifying
the production API.

---

## Lessons Learned

**TDD from the next project forward** — Writing tests after implementation meant
the test suite was shaped by what was already built, not by the behavior
required. Starting with a failing test suite as the specification would have
surfaced the emit ordering decision and the `Object.hasOwn` gap earlier.

**Singleton export guarantees are mechanical, not magical** — The singleton
pattern works because the module system maintains a file-path-keyed registry of
evaluated module records. The constructor runs once. Every importer receives the
same cached reference. Understanding the mechanism (not just the pattern name)
is what makes it transferable to other contexts: database clients, WebSocket
connection managers, global state containers.

**Composition makes the boundary explicit** — Knowing the term "composition over
inheritance" is table stakes. The insight is the reasoning: has-a vs is-a is not
a style preference, it is a question about what the type _is_. A store that
extends EventEmitter _is_ an event emitter, which means consumers can treat it
as one. That's the wrong contract. Composition enforces the right one.

**Emit after write is a correctness constraint, not a convention** — Listeners
that query back into the store after receiving an event must see consistent
state. Emit ordering is not arbitrary — it is determined by what listeners are
allowed to do.
