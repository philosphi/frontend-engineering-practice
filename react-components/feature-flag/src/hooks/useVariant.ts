import { useContext, useEffect } from "react";
import { VariantContext } from "../context/VariantContext";

export function useVariant(experimentId: string) {
  const context = useContext(VariantContext);

  if (!context) {
    throw new Error("useVariant must be used within a VariantProvider");
  }

  // TODO: derive { variant, loading } from context.variants[experimentId].
  // What's the state before an entry exists yet for this experimentId?

  // TODO: trigger the fetch — a useEffect keyed on experimentId that ensures
  // fetchVariant runs exactly once per experimentId, no matter how many
  // components (or re-renders) call useVariant for it.
  useEffect(() => {
    // exposure tracking design question: does firing an "exposure" event
    // belong here (first read of a resolved variant), or is that the
    // calling component's responsibility? Note the decision either way.
  }, [experimentId]);

  // TODO: error handling — if fetchVariant rejects, what should variant/loading
  // resolve to? (a defensible default: fall back to "control")

  // TODO: return { variant, loading }
  return { variant: null, loading: true };
}
