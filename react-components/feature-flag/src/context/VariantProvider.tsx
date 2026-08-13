import { useRef, useState, type ReactNode } from "react";
import { VariantContext } from "./VariantContext";
import type { VariantMap } from "../types";

interface VariantProviderProps {
  children: ReactNode;
}

function VariantProvider({ children }: VariantProviderProps) {
  // TODO: state that drives re-renders — the experimentId -> {variant, loading}
  // map, updated once fetchVariant resolves for a given experiment.
  const [variants, setVariants] = useState<VariantMap>({});

  // TODO: ref for whatever must survive re-renders without *causing* one —
  // e.g. tracking which experimentIds already have a fetch in flight, so two
  // components mounting useVariant for the same experiment don't double-fetch.
  const inFlight = useRef<Set<string>>(new Set());

  // TODO: the function that ensures an experiment's variant is fetched exactly
  // once (check inFlight/variants, call fetchVariant, handle its rejection with
  // a fallback variant, write the result into `variants` via setVariants).
  // Decide whether this is exposed through context for useVariant to call, or
  // whether useVariant calls fetchVariant directly and only reads/writes
  // through context.

  return (
    <VariantContext.Provider value={{ variants }}>
      {children}
    </VariantContext.Provider>
  );
}

export default VariantProvider;
