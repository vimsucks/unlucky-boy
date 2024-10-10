import { Button, ButtonGroup, Center, Heading, HStack, Icon, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';
import { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { FaAngleLeft, FaPlay, FaStop, FaTrash } from 'react-icons/fa6';
import { DEFAULT_STUDENT_NAMES, STUDENT_NAMES_STORE } from '../../store';

export type StudenSlotMachineStepPropType = {
    goToPrevious: () => void;
}

export type StudentSlotMachineStepRefType = {
}


const StudentSlotMachineStep = forwardRef(({ goToPrevious }: StudenSlotMachineStepPropType, ref: Ref<StudentSlotMachineStepRefType>) => {
    const [rolling, setRolling] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const rollingInterval = useRef<number>();
    const [availableStudents, setAvailableStudents] = useState<string[]>([]);
    const [pickedStudents, setPickedStudents] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            const storedNames = await STUDENT_NAMES_STORE.get<string>("names");
            setAvailableStudents((storedNames || DEFAULT_STUDENT_NAMES).split(/\s+/).filter(boy => !!boy.trim()));
        })();
    }, [STUDENT_NAMES_STORE, setAvailableStudents]);

    const remainingStudents = useMemo(() => {
        return availableStudents.filter(s => !pickedStudents?.includes(s));
    }, [availableStudents, pickedStudents]);

    const restart = useCallback(() => {
        setSelectedStudent('');
        setPickedStudents([]);
    }, [setSelectedStudent, setPickedStudents]);

    const start = useCallback(() => {
        if (rolling) {
            return;
        }
        setRolling(true);
        if (remainingStudents.length === 1) {
            setSelectedStudent(remainingStudents[0]);
            setPickedStudents(prev => [...prev, remainingStudents[0]]);
            setRolling(false);
            return;
        }
        setSelectedStudent(remainingStudents[Math.floor(Math.random() * remainingStudents.length)]);
        rollingInterval.current = setInterval(() => {
            setSelectedStudent(remainingStudents[Math.floor(Math.random() * remainingStudents.length)]);
        }, 200);
    }, [rolling, setRolling, rollingInterval.current, remainingStudents, setSelectedStudent]);

    const stop = useCallback(() => {
        if (!rolling) {
            return "";
        }
        setRolling(false);
        clearInterval(rollingInterval.current);
        setPickedStudents(prev => [...prev, selectedStudent]);
    }, [rolling, setRolling, rollingInterval.current, selectedStudent, setPickedStudents])

    useImperativeHandle(ref, () => ({
    }), []);

    const previousStep = useCallback(() => {
        stop();
        goToPrevious();
    }, [goToPrevious, stop])
    return (<>
        <VStack flex={1} >
            <Center flex="1">
                {
                    selectedStudent && (
                        <Heading size="4xl" noOfLines={1}>
                            {rolling
                                ? selectedStudent
                                : `恭喜${selectedStudent}`}
                        </Heading>
                    )
                }
            </Center>
            <Center>
                <HStack wrap="wrap" alignItems="center">
                    {
                        !!pickedStudents.length && <Text fontSize="sm"> 已抽中：</Text>
                    }
                    {pickedStudents.map(s => (
                        <Tag key={s} size="sm" variant='subtle' colorScheme='cyan'><TagLabel>{s}</TagLabel></Tag>
                    ))}
                    <Text fontSize="sm">还剩 {remainingStudents?.length || 0} 个学生</Text>
                </HStack>
            </Center>
            <Center>
                <ButtonGroup variant='outline' spacing='6' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Button onClick={previousStep} disabled={rolling} leftIcon={<Icon as={FaAngleLeft} />}>
                        上一步
                    </Button>
                    {
                        rolling
                            ? <Button
                                colorScheme="red"
                                onClick={stop}
                                variant="solid"
                                leftIcon={<Icon as={FaStop} />}
                            >
                                停！
                            </Button>
                            : (
                                <Button colorScheme="blue"
                                    onClick={start}
                                    isDisabled={!remainingStudents?.length}
                                    variant="solid"
                                    leftIcon={<Icon as={FaPlay} />}
                                >
                                    开始点名
                                </Button>
                            )
                    }
                    {
                        <Button colorScheme="red"
                            onClick={restart}
                            isDisabled={!pickedStudents?.length}
                            leftIcon={<Icon as={FaTrash} />}
                        >
                            重新开始</Button>
                    }
                    {
                    }
                </ButtonGroup>
            </Center>
        </VStack>
    </>);
});

export default StudentSlotMachineStep;