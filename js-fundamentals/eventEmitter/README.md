# EventEmitter

An event subscription system with once-semantics and a OnceEmitter subclass,
built from scratch as part of a structured JavaScript fundamentals curriculum.

## Problem

Write an EventEmitter class that allows developers to subscribe and unsubscribe
listener callbacks to named events. When an event is emitted, all registered
listeners fire sequentially. A once() method allows a listener to subscribe
to an event and automatically unsubscribe after firing once. A OnceEmitter
subclass applies once-semantics to every registration automatically.

## Approach

The naive approach for once() is to register the original callback and call
off() from inside it after execution. This breaks caller-side deregistration —
if the developer calls off() before the event fires, they pass the original
reference, but the Map holds a wrapper. The references don't match and the
listener is never removed.

The correct approach is the ._original wrapper pattern. once() defines a
wrapper function that calls the original callback and then calls off(). The
original reference is stored as a property on the wrapper: wrapper._original =
listener. off() checks both the direct reference and ._original when scanning
the listeners array. This preserves the external API contract — callers always
pass the original reference to off(), whether the listener was registered
with on() or once().

## Key Design Decisions

**Map from event string to Function array** — each event name maps to an
ordered array of listeners. Map is preferred over a plain object because event
names are runtime strings — a plain object would work here, but Map makes the
intent explicit and avoids prototype key collisions.

**off() as a pure filter** — off() replaces the listeners array with a filtered
copy rather than mutating in place via splice. The predicate keeps every
listener that matches neither the direct reference nor ._original:
  l !== listener && l._original !== listener
This handles both on-registered and once-registered listeners with a single
expression.

**._original wrapper pattern** — once() wraps the original callback in a new
function, stores the original as ._original on the wrapper, and registers the
wrapper via on(). This allows off() to match once-registered listeners by
original reference without changing the external API. A developer who registers
with once() can still call off() with the same reference they started with.

**OnceEmitter overrides on(), not once()** — OnceEmitter applies once-semantics
to every registration by overriding on(). Every call to on() — whether from
the caller directly or from once() internally — hits the overridden version
and wraps the callback automatically. No new public API is needed.

**emit() is synchronous and sequential** — listeners fire in insertion order
with no parallelism. Error handling is the caller's responsibility. This matches
the Node.js EventEmitter contract and keeps the implementation predictable.

## Implementation Notes

The ._original check in off() was the non-obvious design decision. The
constraint is that callers must be able to deregister once-registered listeners
using the original reference — the same reference they passed to once(). Because
off() receives only a reference value (not a binding), there is no way to reach
back into the caller's scope and swap what their variable points to. The wrapper
must therefore carry the original reference as a property, and off() must check
for it explicitly.

A secondary bug surfaced during implementation: off() initially called filter()
without reassigning the result back to the Map. filter() returns a new array —
it does not mutate in place. The fix is to call listenerMap.set() with the
filtered result.

## Testing Strategy

Tests verify behavioral contracts, not just output values:

- on() + emit(): listener fires on emission
- off() deregistration: listener does not fire after off() called
- off() with once-registered listener: original reference successfully
  deregisters the wrapper
- once() auto-deregistration: listener fires on first emit, silent on second
- OnceEmitter: all listeners auto-deregister regardless of registration method
- off() before emit() on once-registered listener: listener does not fire

## Concepts Practiced

- Observer pattern — Subject/Observer roles, named event subscription
- Closures and closure-based state preservation
- Class syntax, extends, super
- this binding — method calls on class instances
- Wrapper function pattern and function-as-object (._original property)
- Prototype chain and method override in subclasses
- Immutable array update via filter vs in-place mutation via splice