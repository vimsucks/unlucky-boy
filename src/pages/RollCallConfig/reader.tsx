import { Form, Modal } from "@douyinfe/semi-ui";
import { FormApi } from '@douyinfe/semi-ui/lib/es/form';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as XLSX from 'xlsx';
import { StudentType } from "../../types/students";

export const readStudentListFile = (file: File): Promise<StudentType[]> => {
    return new Promise((resolve) => {
        if (file.name.endsWith(".txt")) {
            readTxt(file).then(resolve);
        } else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
            readSheet(file).then(resolve);
        }
    });
}

const readTxt = (file: File): Promise<StudentType[]> => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve((reader.result as string || "").split(/[\s,，]+/)
                .map(s => s.trim())
                .filter(s => !!s)
                .map(name => ({
                    name
                }))
            );
        };
        reader.readAsText(file);
    })
}

const readSheet = (file: File): Promise<StudentType[]> => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            const workbook = XLSX.read(reader.result);
            openSheetFormModal({
                workbook,
                resolve,
            })
        };
        reader.readAsArrayBuffer(file);
    })
}

type SheetFormModalPropType = {
    workbook: XLSX.WorkBook;
    resolve: (students: StudentType[]) => void;
    onCancel: () => void
}

const SheetFormModal = ({ workbook, resolve, onCancel }: SheetFormModalPropType) => {
    const [formApi, setFormApi] = useState<FormApi>();


    const ok = () => {
        const values = formApi?.getValues();
        const sheet = workbook.Sheets[values.sheet];
        if (!sheet) {
            Modal.error({
                title: `Sheet ${values.sheet} 不存在`,
            })
            return;
        }
        const students = sheet2arr(sheet).map((row, index) => {
            if (values.ignoreFirstLine && index === 0) {
                return null;
            }
            return row[values.column - 1];
        })
            .filter(name => !!name)
            .map(name => ({ name }));
            console.log(students);
        resolve(students);
        onCancel();
    };

    return (
        <Modal
            title="输入姓名列位置"
            visible
            onCancel={onCancel}
            onOk={ok}
        >
            <Form
                initValues={{
                    sheet: workbook.SheetNames[0],
                    column: 1,
                    ignoreFirstLine: true,
                }}
                getFormApi={setFormApi}
            >
                <Form.Select field="sheet" label="在哪张 Sheet？" style={{ width: '100%' }}>
                    {
                        workbook.SheetNames.map(name => (
                            <Form.Select.Option key={name} value={name}>{name}</Form.Select.Option>
                        ))
                    }
                </Form.Select>
                <Form.InputNumber field="column" label="在第几列？" style={{ width: '100%' }} />
                <Form.Checkbox field="ignoreFirstLine" label="忽略第一行" style={{ width: '100%' }} />
            </Form>
        </Modal>
    )
};

const openSheetFormModal = modalHOC<SheetFormModalPropType>(SheetFormModal as any);

function modalHOC<P>(
    WrapperComponent: React.ComponentType<Omit<P, 'onCancel'> & { onCancel?(): void }>,
): (props: Omit<P, 'onCancel'> & { onCancel?(): void }) => void {
    return (props: Omit<P, 'onCancel'> & { onCancel?(): void }): void => {
        const div = document.createElement('div');
        document.body.appendChild(div);

        const root = createRoot(div);

        function onCancel(): void {
            props.onCancel && props.onCancel();
            root.unmount();
            div && div.remove();
        }

        root.render(<WrapperComponent {...props} onCancel={onCancel} />);
    };
}

const sheet2arr = function (sheet: any) {
    var result = [];
    var row;
    var rowNum;
    var colNum;
    var range = XLSX.utils.decode_range(sheet['!ref']);
    for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        row = [];
        for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
            var nextCell = sheet[
                XLSX.utils.encode_cell({ r: rowNum, c: colNum })
            ];
            if (typeof nextCell === 'undefined') {
                row.push(void 0);
            } else row.push(nextCell.w);
        }
        result.push(row);
    }
    return result;
};