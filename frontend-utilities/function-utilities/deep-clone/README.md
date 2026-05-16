# Deep Clone

## Problem Statement

Deep clone copies a value — including all nested objects and arrays —
into a new structure where every reference is distinct from the
original. A shallow copy duplicates only the top-level reference;
nested objects remain shared. Deep clone produces structural identity
with reference independence at every level.

## Concepts Exercised

- Recursive traversal (base case: primitive or special type;
  recursive case: object or array)
- WeakMap for cycle detection and clone mapping
- Special type handling (Date, RegExp)
- TypeScript generics with construction-boundary typing pattern
- `any` during dynamic construction, typed assertion at return
  boundary

## My Approach

**WeakMap over Set:** Cycle detection requires not just "visited"
but "visited — and here is the clone." When a circular reference is
encountered, the recursive call must return the already-created clone
so the cloned structure mirrors the original (clone.friend === clone,
not clone.friend === original). Set provides yes/no. WeakMap provides
original → clone. One edge case determines the entire data structure
choice.

**Clone shell registered before recursion:** The WeakMap entry must
be created immediately after the clone shell is created, before
recursing into children. If a child references the parent, the
recursive call checks the map at the top of the function. Registering
after recursion means the entry does not exist when the cycle is
encountered — infinite loop results.

**Special type branches:** Date and RegExp require constructor
invocation to clone correctly. `new Date(original)` copies the
timestamp; `new RegExp(original.source, original.flags)` copies the
pattern and flags. Naive object spreading loses the underlying value
in both cases.

**Null and primitive check before WeakMap check:** WeakMap keys must
be objects. Querying with a null or primitive key is undefined
behavior across environments. The null/primitive guard must precede
the WeakMap check.

**Inner function closes over WeakMap:** A single WeakMap instance is
shared across all recursive invocations via closure. Each recursive
call reads from and writes to the same map — this is what makes cycle
detection work across the full traversal.

## Implementation Notes

- `any` during object construction is deliberate, not sloppy.
  TypeScript cannot verify dynamic key assignment to a generic type
  — `T[keyof T]` is not assignable to `T`. Use `any` while building
  the object; assert the final type (`as T`) at the return boundary
  only. Internal `any` is contained and does not leak to callers.
- `Object.keys` returns `string[]`. Access via `(value as any)[key]`
  rather than `value[key as keyof T] as T` — the latter double-casts
  and misrepresents the property value type.
- `WeakMap<WeakKey, T>` — value type T is imprecise (stored values
  may be sub-types of T). Acceptable for this phase; library-quality
  typing would restructure the inner function with its own type
  parameter `<U>`.

## Lessons Learned

- **WeakMap vs Set:** Determined entirely by one edge case. Set is
  sufficient for "have I visited this?" — not sufficient for "what
  should I return for this circular reference?"
- **Construction-boundary typing:** Use `any` when constructing
  objects dynamically; assert the type at the return boundary.
  TypeScript is enforcing a real type-level truth — `T[keyof T]`
  genuinely is not T. The `any` acknowledges the limit of what can
  be statically verified, not a gap in discipline.
- **`[keyof T]` is a tuple, not an array.** `[keyof T]` is a
  single-element tuple type. `Array<keyof T>` or `(keyof T)[]` is
  the correct type for a collection of keys.
- **Inner function type parameter:** The inner `clone` function using
  the outer `T` for sub-parts causes type errors because element
  types are not T. Library-quality solution: give the inner function
  its own `<U>` type parameter.

## Testing Strategy

Assertions cover: primitive passthrough (number, string, boolean),
null/undefined passthrough, empty object, flat object, flat array,
nested object, nested array, circular reference, Date, RegExp.

Each structural case asserts both `deepStrictEqual` (same values)
and `notStrictEqual` (different references). The circular reference
test adds `strictEqual(clone.friend, clone)` — this assertion
specifically proves the WeakMap returned the correct clone reference:
the clone points back to itself, not back to the original.
