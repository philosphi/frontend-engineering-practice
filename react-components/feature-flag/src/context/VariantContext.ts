import { createContext } from "react";
import type { VariantContextValue } from "../types";

// TODO: finalize VariantContextValue's shape in types.ts — at minimum the
// variant map, plus whatever else useVariant needs to read/trigger fetches.
export const VariantContext = createContext<VariantContextValue | null>(null);
