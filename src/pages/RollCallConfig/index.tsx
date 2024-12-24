import { IconHelpCircle, IconSearch, IconUserGroup } from '@douyinfe/semi-icons';
import { Button, Checkbox, Input, InputNumber, Space, Tag, Tooltip, Typography, Upload } from '@douyinfe/semi-ui';
import { useRef, useState } from 'react';
import { useRollCallConfig } from '../../context/roll-call';
import { useStep } from '../../context/step';
import { readStudentListFile } from './reader';



const RollCallConfig = () => {
    const { students, setStudents, removeCalled, setRemoveCalled, callCount, setCallCount } = useRollCallConfig();
    const [search, setSearch] = useState<string>("");
    const { next } = useStep();
    const uploadRef = useRef<Upload>(null);

    const openUpload = () => uploadRef.current?.openFileDialog();

    return (
        <>
            <Space vertical align="start" spacing="medium">
                <Typography.Title heading={5}>导入名单</Typography.Title>
                <Upload
                    ref={uploadRef}
                    style={{ width: '100%' }}
                    draggable
                    dragIcon={<IconUserGroup />}
                    action=""
                    accept=".txt,.xls,.xlsx"
                    dragMainText="点击上传学生名单（支持拖拽）"
                    dragSubText="支持 txt/xls/xlsx 文件"
                    beforeUpload={({ file }) => {
                        if (file?.fileInstance) {
                            readStudentListFile(file.fileInstance!!).then(setStudents);
                        }
                        return {
                            autoRemove: true
                        };
                    }}
                >
                </Upload>
                <Input
                    placeholder="搜索"
                    value={search}
                    onChange={setSearch}
                    prefix={<IconSearch />}
                    width="6em"
                />
                <Space wrap>
                    {
                        students
                            .filter(student => student.name.startsWith(search))
                            .map((student, index) => (
                                <Tag key={`${index}-${student.name}`} closable onClose={() => setStudents(prev => prev.filter(s => s.name !== student.name))}>
                                    {student.name}
                                </Tag>
                            ))
                    }
                </Space>
                <Typography.Text type="tertiary" style={{ width: '100%' }}>
                    共计 {students.length} 个学生
                </Typography.Text>
                <Typography.Title heading={5}>更多选项</Typography.Title>
                <Checkbox
                    checked={!removeCalled}
                    onChange={e => setRemoveCalled(!e.target.checked)}
                >
                    允许重复点名同一个人
                    <Tooltip content="勾选后，同一轮点名内不会点到同一个人两次">
                        <IconHelpCircle />
                    </Tooltip>
                </Checkbox>
                <Typography.Text>
                    同时点 <InputNumber value={callCount} onChange={v => setCallCount(v as number)} style={{ width: '5em' }} min={1} max={students.length || 1} /> 位学生
                </Typography.Text>
            </Space>
            <Button onClick={students.length ? next : openUpload} style={{ marginTop: 16 }}>
                {
                    students.length
                        ? '开始点名'
                        : '请导入学生名单'
                }

            </Button>
        </>
    );
}

export default RollCallConfig;