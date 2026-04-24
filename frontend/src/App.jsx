import React, { useEffect, useState } from 'react';
import { Layout, Menu, Table, Button, Upload, Select, Tag, Space, Card, Input, Form, Typography, ConfigProvider, App as AntdApp, message, DatePicker, TimePicker, Popconfirm, Modal, Dropdown } from 'antd';
import { Users, CarFront, UserCheck, FileUp, RefreshCw, Trash2, Plus, Database, Package, Download, Check, X, LogOut, Settings, ChevronDown, Menu as MenuIcon } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';
import Login from './components/Login';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const VEHICLE_MOCK_DATA_AN_NINH = [
  '51F90905', '80A00074', '80A00159', '80A00156', '80A00110', '51F91212', '51F90815', '80A00057', '80A00132', '51F90852',
  '80A00111', '80A00117', '80A00183', '80A00155', '80A00126', '80A00139', '80A00160', '51F29832', '51F29795', '51F29550',
  '51F29211', '51F29072', '51F29340', '51F29790', '51F29817', '51F29887', '51F29945', '51F29765', '51F29723', '51F29819',
  '51F29839', '51F29859', '51F29341', '51F29400', '51F29294', '51F29827', '80A00171', '80A00150', '80A00163', '80A00102',
  '80A00149', '80A00185', '80A00133', '51F29418', '51F29427', '51F29190', '51F29332'
];

const VEHICLE_MOCK_DATA_HOANG_THINH = [
  '51G01358', '51G00298', '51G00779', '51G01390', '51G01410', '51G00885', '51G00839', '51G00907', '51G01382', '51G01081',
  '51G01579', '51G01577', '51G01461', '51G01481', '51G01601', '51G01662', '51G01660', '51G01311', '51G01733', '51G00233',
  '51G01792', '51G01557', '51G01558', '51G01740', '51G01838', '51G01911', '51G01876', '51G01331', '51G01881', '51G01926',
  '51F29834', '51F29297', '51F29138', '51F29384', '51F29442', '51F29720', '51F29731', '51F29200', '51F29744', '51K60460',
  '51K60299', '51K60309', '51K60053', '51K60331', '51K60136', '51K60195', '51K60015', '51K60495', '51K60091', '51K60361',
  '51K60358', '51K60119', '51K60425', '51K60100', '51K60124', '51K60169', '51K60269', '51K60320', '51F60337'
];

const formatDate = (dob) => {
  if (!dob || dob.length !== 8) return 'Chưa có';
  return `${dob.slice(6,8)}/${dob.slice(4,6)}/${dob.slice(0,4)}`;
};

const formatPlate = (plate) => {
  if (!plate) return '';
  const match = plate.match(/^([0-9]+[A-Z]+)(.*)$/i);
  if (match) {
    const prefix = match[1].toUpperCase();
    const nums = match[2].replace(/[^0-9]/g, '');
    return `${prefix}.${nums.slice(0, 3)}.${nums.slice(3)}`;
  }
  return plate;
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const MainApp = ({ user, onLogout }) => {
  const [currentMenu, setCurrentMenu] = useState('boxes');
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [searchText, setSearchText] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDot, setSelectedDot] = useState('1');
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [borrowForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('an_ninh');

  const isAdmin = user?.role === 'admin';

  const openBorrowModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    borrowForm.setFieldsValue({
      gvMuon: vehicle.gvMuon || undefined,
      ngayMuon: vehicle.ngayMuon ? dayjs(vehicle.ngayMuon, 'DD/MM/YYYY HH:mm') : null,
    });
  };

  const handleBorrowSubmit = (values) => {
    const ngayMuonStr = values.ngayMuon ? values.ngayMuon.format('DD/MM/YYYY HH:mm') : '';
    const updatedVehicles = vehicles.map(v => 
      v.id === selectedVehicle.id 
        ? { ...v, gvMuon: values.gvMuon || '', ngayMuon: ngayMuonStr }
        : v
    );
    setVehicles(updatedVehicles);
    saveToStorage('nvdb_vehicles', updatedVehicles);
    setSelectedVehicle(null);
    message.success('Cập nhật thành công');
  };

  const handleReturn = (vehicle) => {
    const updatedVehicles = vehicles.map(v => 
      v.id === vehicle.id 
        ? { ...v, gvMuon: '', ngayMuon: '' }
        : v
    );
    setVehicles(updatedVehicles);
    saveToStorage('nvdb_vehicles', updatedVehicles);
    message.success('Đã trả hộp');
  };

  useEffect(() => { 
    const storedVehicles = loadFromStorage('nvdb_vehicles', null);
    if (!storedVehicles) {
      const allVehicles = [
        ...VEHICLE_MOCK_DATA_AN_NINH.map((plate, i) => ({ id: `an_ninh_${i}`, plate, donVi: 'An Ninh', gvMuon: '', status: 'ranh' })),
        ...VEHICLE_MOCK_DATA_HOANG_THINH.map((plate, i) => ({ id: `hoang_thinh_${i}`, plate, donVi: 'Hoàng Thịnh', gvMuon: '', status: 'ranh' }))
      ];
      setVehicles(allVehicles);
      saveToStorage('nvdb_vehicles', allVehicles);
    } else {
      setVehicles(storedVehicles);
    }
    
    setInstructors(loadFromStorage('nvdb_instructors', []));
    setBoxes(loadFromStorage('nvdb_boxes', []));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, i, b] = await Promise.all([
        axios.get(`${API_BASE}/students`),
        axios.get(`${API_BASE}/instructors`),
        axios.get(`${API_BASE}/boxes`)
      ]);
      setStudents(s.data);
      setInstructors(i.data);
      setBoxes(b.data);
    } catch (e) { 
      console.error(e);
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

  const addInstructor = (values) => {
    const newInstructor = { id: Date.now().toString(), ...values };
    const updated = [...instructors, newInstructor];
    setInstructors(updated);
    saveToStorage('nvdb_instructors', updated);
    message.success('Thêm giáo viên thành công');
  };

  const deleteInstructor = (id) => {
    const updated = instructors.filter(i => i.id !== id);
    setInstructors(updated);
    saveToStorage('nvdb_instructors', updated);
    message.success('Đã xóa');
  };

  const addBox = (values) => {
    const newBox = { id: Date.now().toString(), ...values, status: 'trong', gvMuon: '', ngayMuon: '', gvTra: '', ngayTra: '', xeMuon: '' };
    const updated = [...boxes, newBox];
    setBoxes(updated);
    saveToStorage('nvdb_boxes', updated);
    message.success('Thêm hộp thành công');
  };

  const updateBox = (id, data) => {
    const updated = boxes.map(b => b.id === id ? { ...b, ...data } : b);
    setBoxes(updated);
    saveToStorage('nvdb_boxes', updated);
  };

  const deleteBox = (id) => {
    const updated = boxes.filter(b => b.id !== id);
    setBoxes(updated);
    saveToStorage('nvdb_boxes', updated);
    message.success('Đã xóa');
  };

  const updateVehicle = (id, data) => {
    const updated = vehicles.map(v => v.id === id ? { ...v, ...data } : b);
    setVehicles(updated);
    saveToStorage('nvdb_vehicles', updated);
  };

  const anNinhVehicles = vehicles.filter(v => v.donVi === 'An Ninh');
  const hoangThinhVehicles = vehicles.filter(v => v.donVi === 'Hoàng Thịnh');

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
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        width={240}
        breakpoint="md"
        style={{
          background: '#1e293b',
          zIndex: 999
        }}
      >
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
            ...(isAdmin ? [
              { key: 'boxes', icon: <Package size={18}/>, label: 'Hộp DAT' },
              { key: 'instructors', icon: <UserCheck size={18}/>, label: 'Danh mục Giáo viên' },
              { key: 'users', icon: <Settings size={18}/>, label: 'Quản lý User' },
            ] : [])
          ]}
          style={{background: 'transparent', border: 'none'}}
        />
      </Sider>

      <Layout>
        <Header style={{background: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', borderBottom: '1px solid #e2e8f0', boxShadow: 'none'}}>
          <div>
            <Title level={4} style={{margin:0, color: '#1e293b', fontWeight: 600}}>
              {currentMenu === 'students' ? 'Hồ sơ học viên' : currentMenu === 'instructors' ? 'Danh mục Giáo viên' : currentMenu === 'users' ? 'Quản lý User' : 'Hộp DAT'}
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
          </Space>
        </Header>

        <Content style={{padding: '16px', background: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)'}}>
          {currentMenu === 'instructors' && (
            <Card 
              title={<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><UserCheck size={18} style={{color: '#3b82f6'}}/>Danh mục Giáo viên</div>}
              variant="borderless" 
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px'}}
              extra={<span style={{color: '#94a3b8', fontSize: '13px'}}>{instructors.length} giáo viên</span>}
            >
              <Form layout="inline" style={{marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px'}} onFinish={addInstructor}>
                <Form.Item name="name" required style={{flex: 1, marginBottom: 0}}><Input placeholder="Tên giáo viên" /></Form.Item>
                <Form.Item name="type" initialValue="Số sàn" style={{marginBottom: 0, minWidth: '130px'}}><Select options={[{value:'Số sàn'}, {value:'Tự động'}]}/></Form.Item>
                <Button type="primary" htmlType="submit" icon={<Plus size={16}/>}>Thêm</Button>
              </Form>
              <Table dataSource={instructors} rowKey="id" columns={[
                {title: 'STT', render: (_, __, i) => i + 1, width: 60},
                {title: 'Họ và tên', dataIndex: 'name', width: 250, render: (t) => <span style={{fontWeight: 500}}>{t}</span>},
                {title: 'Loại đào tạo', dataIndex: 'type', render: (t) => <Tag color={t === 'Số sàn' ? 'blue' : 'orange'}>{t}</Tag>},
                {title: '', width: 60, render: (r) => <Button danger type="text" icon={<Trash2 size={16}/>} onClick={() => deleteInstructor(r.id)} />}
              ]} />
            </Card>
          )}

{currentMenu === 'boxes' && (
            <>
              <Card 
                title={<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Package size={18} style={{color: '#8b5cf6'}}/>Hộp DAT</div>}
                variant="borderless" 
                style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', marginBottom: '16px'}}
                extra={
                  <Space>
                    <Tag color="red">An Ninh: {anNinhVehicles.filter(v => v.gvMuon).length}/{anNinhVehicles.length}</Tag>
                    <Tag color="green">Hoàng Thịnh: {hoangThinhVehicles.filter(v => v.gvMuon).length}/{hoangThinhVehicles.length}</Tag>
                  </Space>
                }
              >
                <div style={{marginBottom: '16px', display: 'flex', gap: '12px'}}>
                  <Card size="small" style={{flex: 1, background: '#fef2f2', border: '1px solid #fecaca'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Tag color="red">An Ninh</Tag>
                      <span style={{fontWeight: 600, color: '#dc2626'}}>{anNinhVehicles.length} hộp</span>
                      <span style={{color: '#64748b', fontSize: '12px'}}>
                        ({anNinhVehicles.filter(v => v.gvMuon).length} đang mượn)
                      </span>
                    </div>
                  </Card>
                  <Card size="small" style={{flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Tag color="green">Hoàng Thịnh</Tag>
                      <span style={{fontWeight: 600, color: '#16a34a'}}>{hoangThinhVehicles.length} hộp</span>
                      <span style={{color: '#64748b', fontSize: '12px'}}>
                        ({hoangThinhVehicles.filter(v => v.gvMuon).length} đang mượn)
                      </span>
                    </div>
                  </Card>
                </div>

                <div style={{marginBottom: '12px', display: 'flex', gap: '8px'}}>
                  <Button 
                    type={activeTab === 'an_ninh' ? 'primary' : 'default'}
                    onClick={() => setActiveTab('an_ninh')}
                    style={{background: activeTab === 'an_ninh' ? '#dc2626' : undefined}}
                  >
                    <Tag color="red">An Ninh</Tag> {anNinhVehicles.length} hộp
                  </Button>
                  <Button 
                    type={activeTab === 'hoang_thinh' ? 'primary' : 'default'}
                    onClick={() => setActiveTab('hoang_thinh')}
                    style={{background: activeTab === 'hoang_thinh' ? '#16a34a' : undefined}}
                  >
                    <Tag color="green">Hoàng Thịnh</Tag> {hoangThinhVehicles.length} hộp
                  </Button>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px'}}>
                  {(activeTab === 'an_ninh' ? anNinhVehicles : hoangThinhVehicles).map(v => (
                    <div key={v.id} style={{
                      position: 'relative',
                      padding: '16px',
                      background: v.gvMuon 
                        ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' 
                        : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                      border: `3px solid ${v.gvMuon ? '#f59e0b' : '#10b981'}`,
                      borderRadius: '12px',
                      boxShadow: v.gvMuon 
                        ? '0 4px 15px rgba(245, 158, 11, 0.3)' 
                        : '0 4px 15px rgba(16, 185, 129, 0.3)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>
                      {v.gvMuon && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#f59e0b',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '20px',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          Mượn
                        </div>
                      )}
                      <div style={{
                        background: v.gvMuon ? '#fbbf24' : '#34d399',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '15px',
                        marginBottom: '8px',
                        display: 'inline-block'
                      }}>
                        {formatPlate(v.plate)}
                      </div>
                      {v.gvMuon ? (
                        <>
                          <div style={{
                            marginTop: '8px',
                            padding: '6px 10px',
                            background: 'rgba(245, 158, 11, 0.2)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#b45309'
                          }}>
                            👤 {v.gvMuon}
                          </div>
                          {v.ngayMuon && (
                            <div style={{
                              marginTop: '4px',
                              fontSize: '11px',
                              color: '#92400e'
                            }}>
                              📅 {v.ngayMuon}
                            </div>
                          )}
                          <Button 
                            danger 
                            size="small" 
                            style={{marginTop: '8px'}}
                            onClick={(e) => { e.stopPropagation(); handleReturn(v); }}
                          >
                            Trả hộp
                          </Button>
                        </>
                      ) : (
                        <>
                          <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#059669',
                            fontWeight: 500
                          }}>
                            ✓ Sẵn sàng
                          </div>
                          <Button 
                            type="primary"
                            size="small" 
                            style={{marginTop: '8px', background: '#10b981'}}
                            onClick={(e) => { e.stopPropagation(); openBorrowModal(v); }}
                          >
                            Mượn
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <Modal
                title={`Mượn hộp ${selectedVehicle ? formatPlate(selectedVehicle.plate) : ''}`}
                open={!!selectedVehicle}
                onCancel={() => setSelectedVehicle(null)}
                footer={null}
              >
                <Form form={borrowForm} layout="vertical" onFinish={handleBorrowSubmit}>
                  <Form.Item name="gvMuon" label="Giáo viên mượn" rules={[{ required: true, message: 'Nhập tên giáo viên' }]}>
                    <Input placeholder="Nhập tên giáo viên" />
                  </Form.Item>
                  <Form.Item name="ngayMuon" label="Ngày giờ mượn">
                    <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{width: '100%'}} />
                  </Form.Item>
                  <Form.Item style={{marginBottom: 0, textAlign: 'right'}}>
                    <Space>
                      <Button onClick={() => setSelectedVehicle(null)}>Hủy</Button>
                      <Button type="primary" htmlType="submit">Xác nhận mượn</Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Modal>
            </>
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