import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, message, Popconfirm } from 'antd';
import { api } from '../api';

const { Option } = Select;

const editableColumns = [
  { title: 'STT', dataIndex: 'stt', width: 60, editable: true },
  { title: 'Họ tên', dataIndex: 'fullName', width: 150, editable: true },
  { title: 'Năm sinh', dataIndex: 'dob', width: 80, editable: true },
  { title: 'CCCD', dataIndex: 'cccd', width: 130, editable: true },
  { title: 'Địa chỉ', dataIndex: 'address', width: 150, editable: true },
  { title: 'Học cabin', dataIndex: 'cabinStatus', width: 110, type: 'select', options: ['chưa học', 'đã học'] },
  { title: 'GV Sàn', dataIndex: 'gvSoSan', width: 120, editable: true },
  { title: 'Xe Sàn', dataIndex: 'xeSoSan', width: 100, editable: true },
  { title: 'GV Tự động', dataIndex: 'gvTuDong', width: 120, editable: true },
  { title: 'Xe Tự động', dataIndex: 'xeTuDong', width: 100, editable: true },
  { title: 'Ngày DAT', dataIndex: 'ngayDat', width: 110, editable: true },
  { title: 'Hướng dẫn', dataIndex: 'huongDan', width: 120, editable: true },
];

export default function StudentTable({ className, teachers, onTeacherDrop }) {
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [className]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents(className);
      setStudents(res.data);
    } catch (err) {
      message.error('Lỗi tải dữ liệu');
    }
    setLoading(false);
  };

  const handleUpdate = async (id, field, value) => {
    try {
      await api.updateStudent(id, { [field]: value });
      message.success('Đã cập nhật');
    } catch (err) {
      message.error('Lỗi cập nhật');
    }
  };

  const handleBulkUpdate = async (field, value) => {
    if (selectedIds.length === 0) {
      message.warning('Chọn học viên trước');
      return;
    }
    try {
      await api.bulkUpdate(selectedIds, { [field]: value });
      message.success('Cập nhật thành công');
      loadStudents();
      setSelectedIds([]);
    } catch (err) {
      message.error('Lỗi cập nhật');
    }
  };

  const columns = editableColumns.map(col => ({
    ...col,
    render: (text, record) => {
      if (col.type === 'select') {
        return (
          <Select
            value={text || 'chưa học'}
            onChange={(val) => handleUpdate(record.id, col.dataIndex, val)}
            style={{ width: '100%' }}
            size="small"
          >
            {col.options.map(opt => (
              <Option key={opt} value={opt}>{opt}</Option>
            ))}
          </Select>
        );
      }
      return (
        <Input
          defaultValue={text}
          onBlur={(e) => handleUpdate(record.id, col.dataIndex, e.target.value)}
          style={{ width: '100%' }}
          size="small"
        />
      );
    },
  }));

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: (keys) => setSelectedIds(keys),
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Select
          placeholder="Gán GV Sàn"
          style={{ width: 150 }}
          onChange={(val) => handleBulkUpdate('gvSoSan', val)}
        >
          {teachers.map(t => <Option key={t} value={t}>{t}</Option>)}
        </Select>
        <Select
          placeholder="Gán GV Tự động"
          style={{ width: 150 }}
          onChange={(val) => handleBulkUpdate('gvTuDong', val)}
        >
          {teachers.map(t => <Option key={t} value={t}>{t}</Option>)}
        </Select>
        <Button onClick={() => setSelectedIds([])}>Bỏ chọn</Button>
        <span>Đã chọn: {selectedIds.length}</span>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1500 }}
        size="small"
      />
    </div>
  );
}
