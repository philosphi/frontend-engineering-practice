# A8 — Type Utilities

## Problem Statement

Implement six TypeScript utility types from scratch without using built-in utilities:
`MyPartial`, `MyRequired`, `MyReadonly`, `MyPick`, `MyOmit`, and `MyReturnType`.

## Concepts Exercised

- Mapped types: `[K in keyof T]` syntax
- Generics and generic constraints: `K extends keyof T`
- Property modifiers: `?:` (add optional), `-?:` (remove optional), `readonly`
- Conditional types: `T extends U ? X : Y`
- `infer` for type extraction
- `Exclude<T, U>` as a conditional type primitive
- Indexed access types: `T[K]`

## Implementation Notes

- `-?:` strips the optional modifier — the `-` prefix removes rather than adds. Required for `MyRequired`.
- `MyOmit` uses `Exclude<keyof T, K>` to produce the key set. `Exclude<T, U>` is itself a
  conditional type: `T extends U ? never : T` — distributes over the union, returning only
  members not assignable to U.
- `MyReturnType` uses `infer` inside a conditional type to pattern-match the function shape
  and extract the return type into `R`. `infer` is only valid inside a conditional type's
  extends clause. If T doesn't match the function shape, produces `never`.
- When `K` is already taken as a generic parameter (Pick, Omit), use a separate iteration
  variable `P` in the mapped type body.

## Lessons Learned

- `keyof T` produces a union of literal key types — not the values, just the keys.
- A new generic can be introduced directly inside a type definition (`[P in ...]`) without
  declaring it at the top level.
- `infer` is pattern matching for types — the same mental model as destructuring, but at
  the type level. First exposure; needs retrieval rotation.
- Conditional types distribute over unions automatically — this is what makes `Exclude`
  work across multi-member unions.

## Testing Strategy

Type-level assertions using the `Assert` + `Equals` pattern — TypeScript itself is the
test harness. A type mismatch produces a compile error, not a runtime failure.

```typescript
type Assert<T extends true> = T;
type Equals<A, B> = A extends B ? (B extends A ? true : false) : false;

type test1 = Assert<Equals<MyPartial<Dog>, Partial<Dog>>>;
type test2 = Assert<Equals<MyRequired<Dog>, Required<Dog>>>;
// etc.
```
