# Feature Flag / Experiment Variant Hook

## Problem Statement

Build a hook that tells a component which variant of an experiment a
user is in, so the component can render the right version of a UI
feature — `useVariant(experimentId)` → `{ variant, loading }`.

## Concepts Exercised

- Context + Provider as a session-scoped cache: a user's variant
  assignment must be stable across the whole session — the same
  experiment checked from two different components (or across a
  re-render) must not re-fetch or risk a different assignment.
- `useRef` vs `useState`: which piece of Provider-owned data should
  drive a re-render (the map consumers read) vs. which should just
  persist across renders without triggering one (e.g. in-flight
  request tracking).
- Calling a black-box async dependency (`fetchVariant`) from a hook,
  same shape as `fetchResults` in the Autocomplete practice.
- Error handling with a defensible fallback, not just an error state.
- Design question (may stay a discussion point, not full code):
  should the hook fire an exposure-tracking event itself the first
  time a variant is read, or is that the calling component's job?

## Data Shape

```ts
type Variant = string; // e.g. "control" | "treatment"

interface VariantState {
  variant: Variant | null; // null while loading
  loading: boolean;
}

type VariantMap = Record<string, VariantState>; // keyed by experimentId
```

## Structure

```
src/
  App.tsx                    — mounts VariantProvider around ExperimentDemo
  types.ts                   — Variant / VariantState / VariantMap / VariantContextValue
  api/
    fetchVariant.ts          — black-box dependency, stubbed with a fake
                                delay + random assignment (given, not built)
  context/
    VariantContext.ts        — createContext<VariantContextValue | null>
    VariantProvider.tsx      — owns useState (the map) + useRef (in-flight
                                tracking), wraps children in Context.Provider
  hooks/
    useVariant.ts            — useContext + derive {variant, loading} +
                                trigger the fetch
  components/
    ExperimentDemo.tsx       — sample consumer of useVariant
```

`VariantProvider` and `useVariant` are scaffolded with prop/type
signatures and `TODO` markers — the caching, fetch-triggering, and
error-handling logic is the exercise. `npm run build` won't pass
until the `TODO`s are implemented — that's expected on a fresh
scaffold.

## Running

```bash
npm install
npm run dev
```

## Approach

_TBD — fill in after implementing._

## Lessons Learned

_TBD — fill in after implementing._
