import React, { useEffect, useState } from 'react';
import { Layout, Menu, Table, Button, Upload, Select, Tag, Space, Card, Input, Form, Typography, ConfigProvider, App as AntdApp, message, DatePicker, TimePicker, Popconfirm, Modal, Dropdown } from 'antd';
import { Users, CarFront, UserCheck, FileUp, RefreshCw, Trash2, Plus, Database, Package, Download, Check, X, LogOut, Settings, ChevronDown } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';
import Login from './components/Login';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const formatDate = (dob) => {
  if (!dob || dob.length !== 8) return 'Chưa có';
  return `${dob.slice(6,8)}/${dob.slice(4,6)}/${dob.slice(0,4)}`;
};

const MainApp = ({ user, onLogout }) => {
  const [currentMenu, setCurrentMenu] = useState('students');
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDot, setSelectedDot] = useState('1');
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState([]);

  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, i, v, b] = await Promise.all([
        axios.get(`${API_BASE}/students`),
        axios.get(`${API_BASE}/instructors`),
        axios.get(`${API_BASE}/vehicles`),
        axios.get(`${API_BASE}/boxes`)
      ]);
      setStudents(s.data);
      setInstructors(i.data);
      setVehicles(v.data);
      setBoxes(b.data);
    } catch (e) { 
      console.error(e);
      message.error("Lỗi đồng bộ dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') onLogout();
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${API_BASE}/auth/users`);
    setUsers(res.data);
  };

  useEffect(() => {
    if (currentMenu === 'users' && isAdmin) {
      fetchUsers();
    }
  }, [currentMenu, isAdmin]);

  const addUser = async (values) => {
    await axios.post(`${API_BASE}/auth/register`, values);
    message.success('Thêm user thành công');
    fetchUsers();
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = !searchText || 
      s.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      s.cccd?.includes(searchText);
    const matchClass = !selectedClass || s.className === selectedClass;
    
    let matchDot = true;
    if (selectedDot === '1') {
      matchDot = true;
    } else if (selectedDot === '2' || selectedDot === '3') {
      matchDot = !s.xeSoSan && !s.xeTuDong;
    } else if (selectedDot === 'Chưa phân') {
      matchDot = !s.dot;
    }
    
    return matchSearch && matchClass && matchDot;
  });

  const uniqueClasses = [...new Set(students.map(s => s.className).filter(Boolean))].sort();

  const exportToExcel = () => {
    const headers = [
      'STT', 'Họ tên', 'Ngày sinh', 'CCCD', 'Địa chỉ', 'Lớp', 'Trạng thái Cabin',
      'GV Số Sàn', 'Xe Số Sàn', 'GV Tự Động', 'Xe Tự Động', 'Ngày DAT', 'Đợt', 'Ghi chú'
    ];
    
    const dataRows = filteredStudents.map((s, i) => [
      i + 1,
      s.fullName,
      formatDate(s.dob),
      s.cccd,
      s.address || '',
      s.className || '',
      s.cabinStatus === 'đã học' ? 'Đã học Cabin' : 'Chưa học Cabin',
      s.gvSoSan || '',
      s.xeSoSan || '',
      s.gvTuDong || '',
      s.xeTuDong || '',
      s.ngayDat || '',
      s.dot || '',
      s.ghiChu || ''
    ]);
    
    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #3b82f6; color: white; font-weight: bold; text-align: center; }
          td { font-size: 12px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2 style="text-align: center; color: #1e293b;">DANH SÁCH HỌC VIÊN</h2>
        <p style="text-align: center; color: #64748b;">Khóa: ${selectedClass || 'Tất cả'} - Xuất ngày: ${dayjs().format('DD/MM/YYYY')}</p>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th style="text-align: center;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${dataRows.map(row => `
              <tr>
                <td class="center">${row[0]}</td>
                <td class="bold">${row[1]}</td>
                <td class="center">${row[2]}</td>
                <td>${row[3]}</td>
                <td>${row[4]}</td>
                <td>${row[5]}</td>
                <td class="center">${row[6]}</td>
                <td>${row[7]}</td>
                <td class="center">${row[8]}</td>
                <td>${row[9]}</td>
                <td class="center">${row[10]}</td>
                <td class="center">${row[11]}</td>
                <td class="center">${row[12]}</td>
                <td>${row[13]}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #64748b; font-size: 11px;">
          Tổng số: ${filteredStudents.length} học viên
        </p>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DanhSach_${selectedClass || 'TatCa'}_${dayjs().format('DDMMYYYY')}.xls`;
    link.click();
  };

  const updateStudent = async (id, data) => {
    try {
      await axios.patch(`${API_BASE}/students/${id}`, data);
      message.success("Cập nhật thành công");
      fetchData();
    } catch (e) { message.error("Lỗi cập nhật"); }
  };

  const studentColumns = [
  { 
    title: 'Học viên', 
    fixed: 'left', 
    width: 140,
    render: (_, r) => (
      <div style={{minWidth: 0, overflow: 'hidden'}}>
        <div style={{fontWeight: 600, color: '#1e293b', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.fullName}</div>
        <div style={{fontSize: '10px', color: '#64748b'}}>{formatDate(r.dob)}</div>
      </div>
    )
  },
  { 
    title: 'CCCD', 
    width: 130,
    render: (_, r) => (
      <span style={{fontFamily: 'monospace', fontSize: '11px'}}>{r.cccd || '-'}</span>
    )
  },
  { 
    title: 'Cabin', 
    width: 100,
    render: (_, r) => (
      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
        <div style={{
          padding: '4px',
          borderRadius: '4px',
          background: r.cabinStatus === 'đã học' ? '#dcfce7' : '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {r.cabinStatus === 'đã học' ? <Check size={14} color="#16a34a" /> : <X size={14} color="#dc2626" />}
        </div>
        <Select 
          size="small"
          value={r.cabinStatus || 'chưa học'}
          onChange={(v) => updateStudent(r.id, {cabinStatus: v})}
          options={[
            { label: 'Đã học', value: 'đã học' },
            { label: 'Chưa học', value: 'chưa học' },
          ]}
          style={{flex: 1}}
        />
      </div>
    )
  },
  { 
    title: 'GV Số Sàn', 
    width: 110,
    render: (_, r) => (
      <Select 
        size="small"
        showSearch 
        placeholder="..."
        value={r.gvSoSan || undefined} 
        onChange={(v) => updateStudent(r.id, {gvSoSan: v})}
        options={instructors.filter(i => i.type === 'Số sàn').map(i => ({label: i.name, value: i.name}))}
        popupMatchSelectWidth={180}
        style={{width: '100%'}}
      />
    )
  },
  { 
    title: 'Xe Số Sàn', 
    width: 90,
    render: (_, r) => (
      <Select 
        size="small"
        showSearch 
        placeholder="..."
        value={r.xeSoSan || undefined} 
        onChange={(v) => updateStudent(r.id, {xeSoSan: v})}
        options={vehicles.filter(v => v.type === 'Số sàn').map(v => ({label: v.plate, value: v.plate}))}
        style={{width: '100%'}}
      />
    )
  },
  { 
    title: 'GV Tự Động', 
    width: 110,
    render: (_, r) => (
      <Select 
        size="small"
        showSearch 
        placeholder="..."
        value={r.gvTuDong || undefined} 
        onChange={(v) => updateStudent(r.id, {gvTuDong: v})}
        options={instructors.filter(i => i.type === 'Tự động').map(i => ({label: i.name, value: i.name}))}
        popupMatchSelectWidth={180}
        style={{width: '100%'}}
      />
    )
  },
  { 
    title: 'Xe Tự Động', 
    width: 90,
    render: (_, r) => (
      <Select 
        size="small"
        showSearch 
        placeholder="..."
        value={r.xeTuDong || undefined} 
        onChange={(v) => updateStudent(r.id, {xeTuDong: v})}
        options={vehicles.filter(v => v.type === 'Tự động').map(v => ({label: v.plate, value: v.plate}))}
        style={{width: '100%'}}
      />
    )
  },
  { 
    title: 'Ngày DAT', 
    width: 160,
    render: (_, r) => (
      <DatePicker
        size="small"
        format="DD/MM/YYYY"
        placeholder="Ngày"
        value={r.ngayDat ? dayjs(r.ngayDat, 'DD/MM/YYYY') : null}
        onChange={(date, dateStr) => {
          updateStudent(r.id, {ngayDat: dateStr || ''});
        }}
        style={{width: '120px'}}
      />
    )
  },
];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={240} style={{background: '#1e293b'}}>
        <div style={{padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
          <div style={{padding: '8px', borderRadius: '8px', background: '#3b82f6'}}>
            <CarFront size={20} color="white" />
          </div>
          {!collapsed && <span style={{fontWeight: 700, fontSize: '16px', color: 'white'}}>Tiện ích NVDH</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentMenu]}
          onClick={({key}) => {
            if (key === 'users' && !isAdmin) return;
            setCurrentMenu(key);
          }}
          items={[
            { key: 'students', icon: <Users size={18}/>, label: 'Quản lý Học viên' },
            ...(isAdmin ? [
              { key: 'boxes', icon: <Package size={18}/>, label: 'Phân hộp DAT' },
              { key: 'instructors', icon: <UserCheck size={18}/>, label: 'Danh mục Giáo viên' },
              { key: 'vehicles', icon: <CarFront size={18}/>, label: 'Danh mục Xe tập' },
              { key: 'users', icon: <Settings size={18}/>, label: 'Quản lý User' },
            ] : [])
          ]}
          style={{background: 'transparent', border: 'none'}}
        />
      </Sider>

      {/* RIGHT CONTENT */}
      <Layout>
        <Header style={{background: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', borderBottom: '1px solid #e2e8f0', boxShadow: 'none'}}>
          <div>
            <Title level={4} style={{margin:0, color: '#1e293b', fontWeight: 600}}>
              {currentMenu === 'students' ? 'Hồ sơ học viên' : currentMenu === 'instructors' ? 'Danh mục Giáo viên' : currentMenu === 'vehicles' ? 'Danh mục Xe tập' : currentMenu === 'users' ? 'Quản lý User' : 'Phân hộp DAT'}
            </Title>
          </div>
          <Space>
            <Dropdown menu={{ items: [
              { key: 'logout', icon: <LogOut size={14}/>, label: 'Đăng xuất', danger: true }
            ], onClick: handleMenuClick }} trigger={['click']}>
              <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 500 }}>{user.username}</span>
                <Tag color={isAdmin ? 'blue' : 'default'} style={{ marginLeft: 4 }}>{isAdmin ? 'Admin' : 'Nhân viên'}</Tag>
                <ChevronDown size={14} />
              </Button>
            </Dropdown>
            {currentMenu === 'students' && (
              <>
                <Button icon={<Download size={16} />} onClick={exportToExcel} style={{background: '#10b981', color: 'white', border: 'none'}}>
                  Export Excel
                </Button>
                <Upload customRequest={async ({file}) => {
                  const fd = new FormData(); fd.append('file', file);
                  await axios.post(`${API_BASE}/import-xml`, fd);
                  message.success("Nhập XML thành công"); fetchData();
                }} showUploadList={false}>
                  <Button type="primary" icon={<FileUp size={16} />}> Nhập XML</Button>
                </Upload>
              </>
            )}
            <Button icon={<RefreshCw size={16} />} onClick={fetchData}>Làm mới</Button>
          </Space>
        </Header>

        <Content style={{padding: '16px', background: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)'}}>
          {currentMenu === 'students' && (
            <>
              <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)', borderLeft: '4px solid #3b82f6', flex: 1, minWidth: '140px'}}>
                  <div style={{padding: '8px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white'}}><Users size={16} /></div>
                  <div>
                    <div style={{fontSize: '11px', color: '#64748b', fontWeight: 500}}>Tổng học viên</div>
                    <div style={{fontSize: '22px', fontWeight: 700, color: '#1e293b', lineHeight: 1.2}}>{filteredStudents.length}</div>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)', borderLeft: '4px solid #22c55e', flex: 1, minWidth: '140px'}}>
                  <div style={{padding: '8px', borderRadius: '10px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white'}}><UserCheck size={16} /></div>
                  <div>
                    <div style={{fontSize: '11px', color: '#64748b', fontWeight: 500}}>Đã Cabin</div>
                    <div style={{fontSize: '22px', fontWeight: 700, color: '#16a34a', lineHeight: 1.2}}>{filteredStudents.filter(s=>s.cabinStatus==='đã học').length}</div>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)', borderLeft: '4px solid #f97316', flex: 1, minWidth: '140px'}}>
                  <div style={{padding: '8px', borderRadius: '10px', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white'}}><RefreshCw size={16} /></div>
                  <div>
                    <div style={{fontSize: '11px', color: '#64748b', fontWeight: 500}}>Chưa phân GV</div>
                    <div style={{fontSize: '22px', fontWeight: 700, color: '#ea580c', lineHeight: 1.2}}>{filteredStudents.filter(s=>!s.gvSoSan).length}</div>
                  </div>
                </div>
              </div>

              <div style={{display: 'flex', gap: '12px', marginBottom: '12px'}}>
                <Input
                  placeholder="Tìm kiếm theo tên hoặc CCCD..."
                  prefix={<span style={{color: '#94a3b8'}}>🔍</span>}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{flex: 1, borderRadius: '10px', border: '2px solid #e2e8f0'}}
                  allowClear
                />
                <Select
                  placeholder="Lọc theo lớp"
                  value={selectedClass}
                  onChange={(val) => { setSelectedClass(val); }}
                  allowClear
                  style={{width: '200px', borderRadius: '10px'}}
                  options={uniqueClasses.map(c => ({label: c, value: c}))}
                />
                {selectedClass && (
                  <Popconfirm
                    title={`Xóa toàn bộ học viên lớp "${selectedClass}"?`}
                    description="Hành động này không thể hoàn tác"
                    onConfirm={async () => {
                      try {
                        await axios.delete(`${API_BASE}/students/class/${selectedClass}`);
                        message.success('Đã xóa khóa học');
                        setSelectedClass(null);
                        fetchData();
                      } catch (e) {
                        message.error('Lỗi xóa khóa học');
                      }
                    }}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<Trash2 size={16} />}>
                      Xóa lớp
                    </Button>
                  </Popconfirm>
                )}
                <Select
                  value={selectedDot}
                  onChange={(val) => { setSelectedDot(val); }}
                  style={{width: '130px', borderRadius: '10px'}}
                  options={[
                    { label: 'Đợt 1', value: '1' },
                    { label: 'Đợt 2', value: '2' },
                    { label: 'Đợt 3', value: '3' },
                  ]}
                />
              </div>

              <Card variant="borderless" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                <Table 
                  dataSource={filteredStudents} 
                  columns={studentColumns} 
                  rowKey="id" 
                  loading={loading}
                  size="small"
                  pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} học viên` }}
                />
              </Card>
            </>
          )}

          {currentMenu === 'instructors' && (
            <Card 
              title={<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><UserCheck size={18} style={{color: '#3b82f6'}}/>Danh mục Giáo viên</div>}
              variant="borderless" 
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px'}}
              extra={<span style={{color: '#94a3b8', fontSize: '13px'}}>{instructors.length} giáo viên</span>}
            >
              <Form layout="inline" style={{marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px'}} onFinish={async (v)=>{await axios.post(`${API_BASE}/instructors`,v); fetchData(); message.success('Thêm giáo viên thành công');}}>
                <Form.Item name="name" required style={{flex: 1, marginBottom: 0}}><Input placeholder="Tên giáo viên" /></Form.Item>
                <Form.Item name="type" initialValue="Số sàn" style={{marginBottom: 0, minWidth: '130px'}}><Select options={[{value:'Số sàn'}, {value:'Tự động'}]}/></Form.Item>
                <Button type="primary" htmlType="submit" icon={<Plus size={16}/>}>Thêm</Button>
              </Form>
              <Table dataSource={instructors} rowKey="id" columns={[
                {title: 'STT', render: (_, __, i) => i + 1, width: 60},
                {title: 'Họ và tên', dataIndex: 'name', width: 250, render: (t) => <span style={{fontWeight: 500}}>{t}</span>},
                {title: 'Loại đào tạo', dataIndex: 'type', render: (t) => <Tag color={t === 'Số sàn' ? 'blue' : 'orange'}>{t}</Tag>},
                {title: '', width: 60, render: (r) => <Button danger type="text" icon={<Trash2 size={16}/>} onClick={async()=>{await axios.delete(`${API_BASE}/instructors/${r.id}`); fetchData(); message.success('Đã xóa');}} />}
              ]} />
            </Card>
          )}

          {currentMenu === 'vehicles' && (
            <Card 
              title={<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><CarFront size={18} style={{color: '#f97316'}}/>Danh mục Xe tập</div>}
              variant="borderless" 
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px'}}
              extra={<span style={{color: '#94a3b8', fontSize: '13px'}}>{vehicles.length} xe</span>}
            >
              <Form layout="inline" style={{marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px'}} onFinish={async (v)=>{await axios.post(`${API_BASE}/vehicles`,v); fetchData(); message.success('Thêm xe thành công');}}>
                <Form.Item name="plate" required style={{flex: 1, marginBottom: 0}}><Input placeholder="Biển số xe" /></Form.Item>
                <Form.Item name="type" initialValue="Số sàn" style={{marginBottom: 0, minWidth: '130px'}}><Select options={[{value:'Số sàn'}, {value:'Tự động'}]}/></Form.Item>
                <Button type="primary" htmlType="submit" icon={<Plus size={16}/>}>Thêm</Button>
              </Form>
              <Table dataSource={vehicles} rowKey="id" columns={[
                {title: 'STT', render: (_, __, i) => i + 1, width: 60},
                {title: 'Biển số', dataIndex: 'plate', render: (t) => <span style={{fontFamily: 'monospace', fontWeight: 600, background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px'}}>{t}</span>},
                {title: 'Loại xe', dataIndex: 'type', render: (t) => <Tag color={t === 'Số sàn' ? 'orange' : 'purple'}>{t}</Tag>},
                {title: '', render: (r) => <Button danger type="text" icon={<Trash2 size={16}/>} onClick={async()=>{await axios.delete(`${API_BASE}/vehicles/${r.id}`); fetchData(); message.success('Đã xóa');}} />}
              ]} />
            </Card>
          )}

          {currentMenu === 'users' && isAdmin && (
            <Card 
              title={<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Settings size={18} style={{color: '#3b82f6'}}/>Quản lý User</div>}
              variant="borderless" 
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px'}}
              extra={<span style={{color: '#94a3b8', fontSize: '13px'}}>{users.length} user</span>}
            >
              <Form layout="inline" style={{marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px'}} onFinish={addUser}>
                <Form.Item name="username" required style={{flex: 1, marginBottom: 0}}><Input placeholder="Tài khoản" /></Form.Item>
                <Form.Item name="password" required style={{flex: 1, marginBottom: 0, minWidth: '150px'}}><Input.Password placeholder="Mật khẩu" /></Form.Item>
                <Form.Item name="role" initialValue="staff" style={{marginBottom: 0, minWidth: '130px'}}>
                  <Select options={[{value:'admin', label: 'Admin'}, {value:'staff', label: 'Nhân viên'}]}/>
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<Plus size={16}/>}>Thêm User</Button>
              </Form>
              <Table dataSource={users} rowKey="id" columns={[
                {title: 'STT', render: (_, __, i) => i + 1, width: 60},
                {title: 'Tài khoản', dataIndex: 'username', width: 200, render: (t) => <span style={{fontWeight: 500}}>{t}</span>},
                {title: 'Quyền', dataIndex: 'role', render: (t) => <Tag color={t === 'admin' ? 'blue' : 'default'}>{t === 'admin' ? 'Admin' : 'Nhân viên'}</Tag>},
                {title: '', width: 60, render: (r) => r.id !== user.id && (
                  <Popconfirm title="Xóa user này?" onConfirm={async () => { await axios.delete(`${API_BASE}/auth/users/${r.id}`); fetchUsers(); message.success('Đã xóa'); }}>
                    <Button danger type="text" icon={<Trash2 size={16}/>} />
                  </Popconfirm>
                )}
              ]} />
            </Card>
          )}

          {currentMenu === 'boxes' && (
            <Card 
              title={<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Package size={18} style={{color: '#8b5cf6'}}/>Phân hộp DAT</div>}
              variant="borderless" 
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px'}}
              extra={<span style={{color: '#94a3b8', fontSize: '13px'}}>{boxes.length} hộp</span>}
            >
              <Form layout="inline" style={{marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px'}} onFinish={async (v)=>{await axios.post(`${API_BASE}/boxes`,{...v, status: 'trong'}); fetchData(); message.success('Thêm hộp thành công');}}>
                <Form.Item name="name" required style={{flex: 1, marginBottom: 0}}><Input placeholder="Tên hộp (VD: Hộp 1)" /></Form.Item>
                <Button type="primary" htmlType="submit" icon={<Plus size={16}/>}>Thêm hộp</Button>
              </Form>
              <Table dataSource={boxes} rowKey="id" columns={[
                {title: 'STT', render: (_, __, i) => i + 1, width: 50},
                {title: 'Hộp', dataIndex: 'name', width: 120, render: (t, r) => (
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{padding: '6px', background: r.status === 'trong' ? '#dcfce7' : '#ffedd5', borderRadius: '8px'}}>
                      <Package size={16} style={{color: r.status === 'trong' ? '#16a34a' : '#ea580c'}}/>
                    </div>
                    <div>
                      <div style={{fontWeight: 600, fontSize: '12px'}}>{t}</div>
                      <Tag color={r.status === 'trong' ? 'success' : 'warning'} style={{fontSize: '10px', marginTop: '2px'}}>
                        {r.status === 'trong' ? 'Trống' : 'Đang mượn'}
                      </Tag>
                    </div>
                  </div>
                )},
                {title: 'GV mượn', width: 160, render: (_, r) => (
                  <Select
                    size="small"
                    showSearch
                    placeholder="Chọn GV"
                    value={r.gvMuon || undefined}
                    onChange={(v) => {
                      axios.patch(`${API_BASE}/boxes/${r.id}`, {gvMuon: v, status: 'dang_muon'}).then(() => fetchData());
                    }}
                    options={instructors.map(i => ({label: i.name, value: i.name}))}
                    style={{width: '100%'}}
                  />
                )},
                {title: 'Ngày giờ mượn', width: 200, render: (_, r) => (
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <DatePicker
                      size="small"
                      format="DD/MM/YYYY"
                      placeholder="Ngày"
                      value={r.ngayMuon ? dayjs(r.ngayMuon.split(' ')[0], 'DD/MM/YYYY') : null}
                      onChange={(date, dateStr) => {
                        const timeStr = r.ngayMuon ? r.ngayMuon.split(' ')[1] : '08:00';
                        axios.patch(`${API_BASE}/boxes/${r.id}`, {ngayMuon: dateStr ? `${dateStr} ${timeStr}` : ''}).then(() => fetchData());
                      }}
                      style={{width: '110px'}}
                    />
                    <TimePicker
                      size="small"
                      format="HH:mm"
                      placeholder="Giờ"
                      value={r.ngayMuon ? dayjs(r.ngayMuon.split(' ')[1], 'HH:mm') : null}
                      onChange={(time, timeStr) => {
                        const dateStr = r.ngayMuon ? r.ngayMuon.split(' ')[0] : dayjs().format('DD/MM/YYYY');
                        axios.patch(`${API_BASE}/boxes/${r.id}`, {ngayMuon: timeStr ? `${dateStr} ${timeStr}` : ''}).then(() => fetchData());
                      }}
                      minuteStep={15}
                      style={{width: '80px'}}
                    />
                  </div>
                )},
                {title: 'GV trả', width: 160, render: (_, r) => (
                  <Select
                    size="small"
                    showSearch
                    placeholder="Chọn GV"
                    value={r.gvTra || undefined}
                    onChange={(v) => {
                      axios.patch(`${API_BASE}/boxes/${r.id}`, {gvTra: v, status: 'trong'}).then(() => fetchData());
                    }}
                    options={instructors.map(i => ({label: i.name, value: i.name}))}
                    style={{width: '100%'}}
                  />
                )},
                {title: 'Ngày giờ trả', width: 200, render: (_, r) => (
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <DatePicker
                      size="small"
                      format="DD/MM/YYYY"
                      placeholder="Ngày"
                      value={r.ngayTra ? dayjs(r.ngayTra.split(' ')[0], 'DD/MM/YYYY') : null}
                      onChange={(date, dateStr) => {
                        const timeStr = r.ngayTra ? r.ngayTra.split(' ')[1] : '17:00';
                        axios.patch(`${API_BASE}/boxes/${r.id}`, {ngayTra: dateStr ? `${dateStr} ${timeStr}` : ''}).then(() => fetchData());
                      }}
                      style={{width: '110px'}}
                    />
                    <TimePicker
                      size="small"
                      format="HH:mm"
                      placeholder="Giờ"
                      value={r.ngayTra ? dayjs(r.ngayTra.split(' ')[1], 'HH:mm') : null}
                      onChange={(time, timeStr) => {
                        const dateStr = r.ngayTra ? r.ngayTra.split(' ')[0] : dayjs().format('DD/MM/YYYY');
                        axios.patch(`${API_BASE}/boxes/${r.id}`, {ngayTra: timeStr ? `${dateStr} ${timeStr}` : ''}).then(() => fetchData());
                      }}
                      minuteStep={15}
                      style={{width: '80px'}}
                    />
                  </div>
                )},
                {title: '', width: 50, render: (r) => <Button danger type="text" icon={<Trash2 size={16}/>} onClick={async()=>{await axios.delete(`${API_BASE}/boxes/${r.id}`); fetchData(); message.success('Đã xóa');}} />}
              ]} />
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('drive_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('drive_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('drive_user');
  };

  if (!user) {
    return (
      <ConfigProvider theme={{ 
        token: { 
          colorPrimary: '#3b82f6', 
          borderRadius: 10,
        }
      }}>
        <AntdApp>
          <Login onLogin={handleLogin} />
        </AntdApp>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={{ 
      token: { 
        colorPrimary: '#3b82f6', 
        borderRadius: 10,
        fontFamily: "'Inter', -apple-system, sans-serif",
      },
      components: { 
        Layout: { headerBg: '#ffffff' },
        Table: { headerBg: '#f8fafc' }
      }
    }}>
      <AntdApp>
        <MainApp user={user} onLogout={handleLogout} />
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;