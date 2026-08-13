import { useVariant } from "../hooks/useVariant";

const EXPERIMENT_ID = "homepage-hero-cta";

function ExperimentDemo() {
  const { variant, loading } = useVariant(EXPERIMENT_ID);

  // TODO: render the right UI per variant, plus a loading state while
  // `variant` is null. Mount this component more than once (or add a
  // second consumer) to sanity-check that both share the same assignment
  // instead of re-fetching / re-rolling.
  return (
    <div>
      <p>experiment: {EXPERIMENT_ID}</p>
      <p>loading: {String(loading)}</p>
      <p>variant: {variant ?? "null"}</p>
    </div>
  );
}

export default ExperimentDemo;
