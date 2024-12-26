import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { StudentType } from "../types/students";

export const RollCallConfigContext = createContext<{
    students: StudentType[]
    setStudents: Dispatch<SetStateAction<StudentType[]>>;
    removeCalled: boolean;
    setRemoveCalled: Dispatch<SetStateAction<boolean>>;
    callCount: number;
    setCallCount: Dispatch<SetStateAction<number>>;
    intervalMillis: number;
    setIntervalMillis: Dispatch<SetStateAction<number>>;
}>({
    students: [],
    setStudents: () => {},
    removeCalled: false,
    setRemoveCalled: () => {},
    callCount: 1,
    setCallCount: () => {},
    intervalMillis: 50,
    setIntervalMillis: () => {},
});

export const useRollCallConfig = () => useContext(RollCallConfigContext);