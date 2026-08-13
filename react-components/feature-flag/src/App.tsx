import VariantProvider from "./context/VariantProvider";
import ExperimentDemo from "./components/ExperimentDemo";
import "./App.css";

function App() {
  return (
    <VariantProvider>
      <ExperimentDemo />
    </VariantProvider>
  );
}

export default App;
