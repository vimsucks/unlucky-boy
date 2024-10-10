
import { Box, Icon, Text, Textarea, VStack } from '@chakra-ui/react';
import { debounce } from 'radash';
import { forwardRef, Ref, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { FaCheck } from 'react-icons/fa6';
import { DEFAULT_STUDENT_NAMES, STUDENT_NAMES_STORE } from '../../store';

export type InputStudentNamesStepPropType = {
}

export type InputStudentNamesStepRefType = {
    save: () => Promise<void>;
}

const InputStudentNamesStep = forwardRef(({ }: InputStudentNamesStepPropType, ref: Ref<InputStudentNamesStepRefType>) => {
    const [names, setNames] = useState<string>('');
    const [savedNames, setSavedNames] = useState<string>('');

    useEffect(() => {
        (async () => {
            const storedNames = await STUDENT_NAMES_STORE.get<string>("names");
            setNames(storedNames || DEFAULT_STUDENT_NAMES);
            setSavedNames(storedNames || DEFAULT_STUDENT_NAMES);
        })();
    }, [setNames, STUDENT_NAMES_STORE])

    const debouncedSave = useMemo(() => {
        return debounce({ delay: 1000 }, async (n: string) => {
            await STUDENT_NAMES_STORE.set("names", n);
            setSavedNames(n)
        });
    }, [STUDENT_NAMES_STORE, setSavedNames]);

    useEffect(() => {
        debouncedSave(names);
    }, [names, debouncedSave])

    useImperativeHandle(ref, () => ({
        save: async () => {
            await STUDENT_NAMES_STORE.set("names", names);
        },
    }), [names]);

    return (<>
        <VStack align="flex-start">
            <Textarea
                value={names}
                onChange={e => setNames(e.target.value)}
                placeholder="输入具体的倒霉鬼名单，按回车或空格分隔"
                style={{ minHeight: 200 }}
            />
            <Box>
                <Text fontSize="xs">
                    {savedNames === names && <Icon as={FaCheck}/>}
                    {savedNames === names ? '已保存' : '尚未保存'}
                </Text>
            </Box>
        </VStack>
    </>);
});

export default InputStudentNamesStep;