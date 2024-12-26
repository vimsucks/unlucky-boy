import { IconArrowLeft, IconPause, IconPlay, IconRefresh } from "@douyinfe/semi-icons";
import { Button, Col, HotKeys, Layout, Row, Space, Typography } from "@douyinfe/semi-ui";
import { useCallback, useRef, useState } from "react";
import { useRollCallConfig } from "../../context/roll-call";
import { useStep } from "../../context/step";
import { StudentType } from "../../types/students";

const Roll = () => {
    const { prev } = useStep();

    const { students, removeCalled, callCount, intervalMillis } = useRollCallConfig();
    const [remainingStudents, setRemainingStudents] = useState<StudentType[]>(students);
    const [rolling, setRolling] = useState(false);
    const intervalRef = useRef<number>();
    const calledStudentsRef = useRef<StudentType[]>([]);
    const [rolledAt, setRolledAt] = useState<Date>();

    const roll = useCallback(() => {
        setRolledAt(new Date());
        let calledStudentsThisRound: StudentType[] = [];

        let studentsThisRound = [...remainingStudents];
        let studentCountToCallThisRound = Math.min(callCount, studentsThisRound.length);
        for (let i = 0; i < studentCountToCallThisRound; i++) {
            const called = studentsThisRound[Math.floor(Math.random() * studentsThisRound.length)];
            calledStudentsThisRound.push(called);
            studentsThisRound = studentsThisRound.filter(s => s.name !== called.name);
        }

        calledStudentsRef.current = calledStudentsThisRound;
        if (!studentsThisRound.length) {
            clearInterval(intervalRef.current);
            setRolling(false);
            if (removeCalled) {
                setRemainingStudents([]);
            }
        }
        return !studentsThisRound.length;
    }, [intervalRef, calledStudentsRef, students, removeCalled, remainingStudents, setRolling, setRemainingStudents]);

    const pause = useCallback(() => {
        clearInterval(intervalRef.current);
        roll();
        setRolling(false);
        if (removeCalled && !!calledStudentsRef.current.length) {
            const calledStudentNames = calledStudentsRef.current.map(s => s.name);
            setRemainingStudents(prev => prev.filter(s => !calledStudentNames.includes(s.name)));
        }
    }, [roll, intervalRef, setRolling, removeCalled, calledStudentsRef, setRemainingStudents])

    const start = useCallback(() => {
        const terminated = roll();
        if (terminated) {
            return;
        }
        setRolling(true);
        intervalRef.current && clearInterval(intervalRef.current);
        intervalRef.current = setInterval(roll, intervalMillis);
    }, [roll, intervalRef, setRolling, setRemainingStudents, pause, intervalMillis]);

    const restart = useCallback(() => {
        calledStudentsRef.current = [];
        setRemainingStudents(students);
    }, [students, calledStudentsRef, setRemainingStudents]);

    const onSpaceClick = () => {
        if (!remainingStudents.length) {
            return;
        } else if (rolling) {
            pause();
        } else {
            start();
        }
    }

    return (
        <>
            <Layout style={{ height: 'calc(100vh - 180px)' }}>
                <Layout.Header style={{ display: 'flex' }}>
                    <Button onClick={prev}>
                        <IconArrowLeft />
                    </Button>
                </Layout.Header>
                <Layout.Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Row gutter={[0, 64]} style={{ width: '100%', zIndex: -1, }} key={rolledAt?.toISOString()}>
                        {!calledStudentsRef.current.length &&
                            <Col span={24}>
                                <Typography.Title style={{ fontSize: 64 }}>按空格键以开始/暂停</Typography.Title>
                            </Col>
                        }
                        {calledStudentsRef.current.map(s =>
                            <Col span={calledStudentsRef.current.length == 1 ? 24 : 12}>
                                <Typography.Title style={{ fontSize: 64 }}>{s.name}</Typography.Title>
                            </Col>
                        )}
                    </Row>
                </Layout.Content>
                <Layout.Footer>
                    <Space>
                        {removeCalled && !!calledStudentsRef.current.length &&
                            <Button
                                disabled={rolling}
                                type="danger"
                                icon={<IconRefresh />}
                                size="large"
                                onClick={restart}
                            >
                                重置
                            </Button>
                        }
                        {
                            rolling
                                ? <Button block icon={<IconPause />} onClick={pause} type="warning" size="large">暂停</Button>
                                : (!!remainingStudents.length && <Button
                                    block
                                    icon={<IconPlay />}
                                    onClick={start}
                                    type="primary"
                                    disabled={!remainingStudents.length}
                                    size="large"
                                >开始</Button>)

                        }
                        <HotKeys hotKeys={[HotKeys.Keys.Space]} onHotKey={onSpaceClick} content={[]} />
                    </Space>
                </Layout.Footer>
            </Layout>
        </>
    );
}

export default Roll;