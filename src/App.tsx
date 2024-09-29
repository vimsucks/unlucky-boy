import { useCallback, useEffect, useRef, useState } from "react";
import { Store } from "tauri-plugin-store-api";


import { Button, ButtonGroup, Heading, Spinner } from '@chakra-ui/react';

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
  Textarea,
  useSteps,
} from '@chakra-ui/react';
import "./App.css";

const store = new Store(".unlucky-boy.settings.dat");

const steps = [
  { title: '输入倒霉鬼名单', description: '' },
  { title: '抽取倒霉鬼', description: '' },
]

function App() {
  const { activeStep, goToNext, goToPrevious } = useSteps({
    index: 1,
    count: steps.length,
  });

  const [names, setNames] = useState<string>('');
  const [unluckyBoy, setUnluckyBoy] = useState<string>('');

  const [picking, setPicking] = useState<boolean>(false);
  const pickingInterval = useRef<number>();

  useEffect(() => {
    (async () => {
      const storedNames = await store.get<string>("names");
      if (storedNames) {
        setNames(storedNames);
      } else {
        setNames(`张三\n李四\n王五`)
      }
    })();
  }, [setNames])

  const goToNextStep = useCallback(() => {
    store.set("names", names);
    goToNext();
  }, [names, goToNext]);

  const start = useCallback(() => {
    setPicking(true);
    const boys = names.split("\n").filter(boy => !!boy.trim());
    pickingInterval.current = setInterval(() => {
      setUnluckyBoy(boys[Math.floor(Math.random() * boys.length)]);
    }, 200);
  }, [names, setPicking, pickingInterval]);

  const stop = useCallback(() => {
    setPicking(false);
    clearInterval(pickingInterval.current);
  }, [setPicking, pickingInterval]);


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
            <Textarea
              value={names}
              onChange={e => setNames(e.target.value)}
              placeholder="输入具体的倒霉鬼名单，按回车分割"
              style={{minHeight: 200}}
            />
            <Button colorScheme="blue" onClick={goToNextStep}>下一步：抽取倒霉蛋</Button>
</>
        )
      }
      {
        activeStep === 2 && (
          <>
              {
                unluckyBoy && (
                  <Heading>
                  { picking
                    ? unluckyBoy
                    : `恭喜${unluckyBoy}` }
                  </Heading>
                )
              }
            <ButtonGroup variant='outline' spacing='6' style={{ display: 'flex', justifyContent: 'center'}}>
              <Button onClick={goToPrevious} disabled={picking}>返回上一步</Button>
              {
                picking
                  ?
                  <Button colorScheme="red" onClick={stop} ><Spinner />停！</Button>
                  : <Button colorScheme="blue" onClick={start} isLoading={picking}>抽取倒霉蛋</Button>
              }
            </ButtonGroup>
</>
        )
      }
    </div>
  );
}

export default App;
