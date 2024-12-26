import { useState } from "react";
import "./App.css";
import { RollCallConfigContext } from "./context/roll-call.ts";
import { StepContext } from "./context/step.ts";
import Roll from "./pages/Roll/index.tsx";
import RollCallConfig from "./pages/RollCallConfig/index.tsx";
import { StudentType } from "./types/students";


function App() {
  const [students, setStudents] = useState<StudentType[]>([]);
  const [removeCalled, setRemoveCalled] = useState<boolean>(false);
  const [callCount, setCallCount] = useState<number>(1);
  const [intervalMillis, setIntervalMillis] = useState<number>(50);
  const [step, setStep] = useState<number>(0);

  return (
    <StepContext.Provider value={{ step, next: () => setStep(prev => prev + 1), prev: () => setStep(prev => prev - 1) }}>
      <RollCallConfigContext.Provider value={{ students, setStudents, removeCalled, setRemoveCalled, callCount, setCallCount, intervalMillis, setIntervalMillis }}>
        <main className="container">
          {step === 0 && <RollCallConfig />}
          {step === 1 && <Roll />}
        </main>
      </RollCallConfigContext.Provider>
    </StepContext.Provider>
  );
}

export default App;
