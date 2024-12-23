import { createContext, useContext } from "react";

export const StepContext = createContext<{
    step: number;
    next: () => void;
    prev: () => void;
}>({
    step: 0,
    next: () => {},
    prev: () => {},
});

export const useStep = () => useContext(StepContext);