import { useCallback, useRef } from "react";


import { Button, Icon } from '@chakra-ui/react';

import {
  Box,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps
} from '@chakra-ui/react';
import "./App.css";
import InputStudentNamesStep, { InputStudentNamesStepRefType } from "./components/InputStudentNamesStep";
import StudentSlotMachineStep from "./components/StudentSlotMachineStep";
import { FaAngleRight } from "react-icons/fa6";


const steps = [
  { title: '输入名单', description: '' },
  { title: '开始点名', description: '' },
]

function App() {
  const { activeStep, goToNext, goToPrevious } = useSteps({
    index: 1,
    count: steps.length,
  });

  const inputNameStepRef = useRef<InputStudentNamesStepRefType>({ save: () => Promise.resolve() });

  const goToSlotMachineStep = useCallback(() => {
    inputNameStepRef.current?.save().then(goToNext);
  }, [inputNameStepRef.current, goToNext]);

  return (
    <div className="container">
      <Stepper index={activeStep}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink='0'>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      {
        activeStep === 1 && (
          <>
            <InputStudentNamesStep ref={inputNameStepRef} />
            <Button colorScheme="blue" onClick={goToSlotMachineStep} leftIcon={<Icon as={FaAngleRight} />}>
               下一步
            </Button>
          </>
        )
      }
      {
        activeStep === 2 && (
          <>
            <StudentSlotMachineStep
              goToPrevious={goToPrevious}
            />
          </>
        )
      }
    </div>
  );
}

export default App;
