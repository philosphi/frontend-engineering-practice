export type Variant = string // e.g. "control" | "treatment"

export interface VariantState {
  variant: Variant | null // null while loading (or if not yet requested)
  loading: boolean
}

// One VariantState per experimentId, shared across every component that
// calls useVariant — this is what makes the assignment stable/consistent
// instead of living in per-component useState.
export type VariantMap = Record<string, VariantState>

export interface VariantContextValue {
  variants: VariantMap
  // TODO: anything else the Provider needs to expose to useVariant —
  // e.g. a function to request/ensure an experiment's variant is fetched.
}
