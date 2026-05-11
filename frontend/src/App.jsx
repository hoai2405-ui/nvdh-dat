import React, { useEffect, useState } from 'react';
import { Layout, Menu, Table, Button, Upload, Select, Tag, Space, Card, Input, Form, Typography, ConfigProvider, App as AntdApp, message, DatePicker, TimePicker, Popconfirm, Modal, Dropdown } from 'antd';
import { Users, CarFront, UserCheck, FileUp, RefreshCw, Trash2, Plus, Database, Package, Download, Check, X, LogOut, Settings, ChevronDown, Menu as MenuIcon, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from './api';
import Login from './components/Login';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

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

const HISTORY_STORAGE_KEY = 'nvdh_box_history';
const MENU_VISIBILITY_KEY = 'nvdh_menu_visibility';

const DEFAULT_MENU_VISIBILITY = { students: false, boxes: true, instructors: true, vehicles: true, users: true };

const loadMenuVisibility = () => {
  try {
    const saved = localStorage.getItem(MENU_VISIBILITY_KEY);
    if (saved) return { ...DEFAULT_MENU_VISIBILITY, ...JSON.parse(saved), students: DEFAULT_MENU_VISIBILITY.students };
  } catch {}
  return { ...DEFAULT_MENU_VISIBILITY };
};

const DEFAULT_VEHICLES = [
  ...['51F90905','80A00074','80A00159','80A00156','80A00110','51F91212','51F90815','80A00057','80A00132','51F90852','80A00111','80A00117','80A00183','80A00155','80A00126','80A00139','80A00160','51F29832','51F29795','51F29550','51F29211','51F29072','51F29340','51F29790','51F29817','51F29887','51F29945','51F29765','51F29723','51F29819','51F29839','51F29859','51F29341','51F29400','51F29294','51F29827','80A00171','80A00150','80A00163','80A00102','80A00149','80A00185','80A00133','51F29418','51F29427','51F29190','51F29332'].map((p, i) => ({
    id: `an_${i}_${p}`, plate: p, donVi: 'An Ninh', type: 'Số sàn', gvMuon: '', ngayMuon: '', status: 'ranh'
  })),
  ...['51G01358','51G00298','51G00779','51G01390','51G01410','51G00885','51G00839','51G00907','51G01382','51G01081','51G01579','51G01577','51G01461','51G01481','51G01601','51G01662','51G01660','51G01311','51G01733','51G00233','51G01792','51G01557','51G01558','51G01740','51G01838','51G01911','51G01876','51G01331','51G01881','51G01926','51F29834','51F29297','51F29138','51F29384','51F29442','51F29720','51F29731','51F29200','51F29744','51K60460','51K60299','51K60309','51K60053','51K60331','51K60136','51K60195','51K60015','51K60495','51K60091','51K60361','51K60358','51K60119','51K60425','51K60100','51K60124','51K60169','51K60269','51K60320','51F60337'].map((p, i) => ({
    id: `ht_${i}_${p}`, plate: p, donVi: 'Hoàng Thịnh', type: 'Số sàn', gvMuon: '', ngayMuon: '', status: 'ranh'
  }))
];

const loadHistory = () => {
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
};

const MainApp = ({ user, onLogout }) => {
  const [currentMenu, setCurrentMenu] = useState('boxes');
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [boxHistory, setBoxHistory] = useState([]);
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
  const [boxSearchText, setBoxSearchText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [menuVisibility, setMenuVisibility] = useState(loadMenuVisibility);

  const saveMenuVisibility = (v) => {
    setMenuVisibility(v);
    localStorage.setItem(MENU_VISIBILITY_KEY, JSON.stringify(v));
    if (user?.id) api.updateSettings(user.id, v).catch(() => {});
  };

  useEffect(() => {
    if (!user?.id) return;
    api.getSettings(user.id).then(settings => {
      if (settings && Object.keys(settings).length > 0) {
        setMenuVisibility(prev => ({ ...DEFAULT_MENU_VISIBILITY, ...settings, students: DEFAULT_MENU_VISIBILITY.students }));
        localStorage.setItem(MENU_VISIBILITY_KEY, JSON.stringify(settings));
      }
    }).catch(() => {});
  }, [user]);

  const isAdmin = user?.role === 'admin';

  const openBorrowModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    borrowForm.setFieldsValue({
      gvMuon: vehicle.gvMuon || undefined,
      ngayMuon: vehicle.ngayMuon ? dayjs(vehicle.ngayMuon, 'DD/MM/YYYY HH:mm') : null,
    });
  };

  const handleBorrowSubmit = async (values) => {
    const ngayMuonStr = values.ngayMuon ? values.ngayMuon.format('DD/MM/YYYY HH:mm') : '';
    try {
      await api.updateVehicle(selectedVehicle.id, { gvMuon: values.gvMuon || '', ngayMuon: ngayMuonStr, status: 'dang_muon' });
      const entry = {
        id: Date.now().toString(),
        plate: selectedVehicle.plate,
        donVi: selectedVehicle.donVi,
        gvMuon: values.gvMuon || '',
        ngayMuon: ngayMuonStr,
        ngayTra: '',
        action: 'mượn',
        createdAt: dayjs().format('DD/MM/YYYY HH:mm:ss')
      };
      saveHistory([entry, ...boxHistory]);
      await api.addBoxHistory(entry).catch(() => {});
      message.success('Đã cho mượn hộp');
      setSelectedVehicle(null);
      fetchData();
    } catch (e) {
      message.error('Lỗi cho mượn hộp');
    }
  };

  const handleReturn = async (vehicle) => {
    try {
      await api.updateVehicle(vehicle.id, { gvMuon: '', ngayMuon: '', status: 'ranh' });
      const entry = {
        id: Date.now().toString(),
        plate: vehicle.plate,
        donVi: vehicle.donVi,
        gvMuon: vehicle.gvMuon,
        ngayMuon: vehicle.ngayMuon,
        ngayTra: dayjs().format('DD/MM/YYYY HH:mm'),
        action: 'trả',
        createdAt: dayjs().format('DD/MM/YYYY HH:mm:ss')
      };
      saveHistory([entry, ...boxHistory]);
      await api.addBoxHistory(entry).catch(() => {});
      message.success('Đã trả hộp');
      fetchData();
    } catch (e) {
      message.error('Lỗi trả hộp');
    }
  };

  const saveHistory = (newHistory) => {
    setBoxHistory(newHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, i, v, b] = await Promise.all([
        api.getStudents(),
        api.getInstructors(),
        api.getVehicles(),
        api.getBoxes()
      ]);
      if (v && v.length > 0) {
        setVehicles(v);
      } else {
        const batchSize = 10;
        for (let i = 0; i < DEFAULT_VEHICLES.length; i += batchSize) {
          const batch = DEFAULT_VEHICLES.slice(i, i + batchSize);
          await Promise.all(batch.map(dv => {
            const { id, ...rest } = dv;
            return api.addVehicle(rest);
          }));
        }
        const seeded = await api.getVehicles();
        setVehicles(seeded || []);
      }
      setStudents(s || []);
      setInstructors(i || []);
      setBoxes(b || []);
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
    const res = await api.getUsers();
    setUsers(res || []);
  };

  useEffect(() => {
    if (currentMenu === 'users' && isAdmin) {
      fetchUsers();
    }
  }, [currentMenu, isAdmin]);

  useEffect(() => {
    api.getBoxHistory().then(history => {
      if (history && history.length > 0) {
        setBoxHistory(history);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      } else {
        const local = loadHistory();
        if (local.length > 0) setBoxHistory(local);
      }
    }).catch(() => {
      const local = loadHistory();
      if (local.length > 0) setBoxHistory(local);
    });
  }, []);

  const addUser = async (values) => {
    await api.addUser(values);
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

  const exportBoxesToExcel = () => {
    const headers = ['STT', 'Biển số', 'Đơn vị', 'Người mượn'];
    const sorted = [...vehicles].sort((a, b) => a.donVi === b.donVi ? 0 : a.donVi === 'An Ninh' ? -1 : 1);
    const dataRows = sorted.map((v, i) => [
      i + 1,
      formatPlate(v.plate),
      v.donVi,
      v.gvMuon || ''
    ]);

    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #8b5cf6; color: white; font-weight: bold; text-align: center; }
          td { font-size: 12px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <h2 style="text-align: center; color: #1e293b;">DANH SÁCH HỘP DAT</h2>
        <p style="text-align: center; color: #64748b;">Xuất ngày: ${dayjs().format('DD/MM/YYYY')}</p>
        <table>
          <thead><tr>${headers.map(h => `<th style="text-align: center;">${h}</th>`).join('')}</tr></thead>
          <tbody>${dataRows.map(row => `<tr>${row.map(c => `<td class="center">${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        <p style="margin-top: 20px; color: #64748b; font-size: 11px;">Tổng số: ${vehicles.length} hộp</p>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DanhSachHopDAT_${dayjs().format('DDMMYYYY')}.xls`;
    link.click();
  };

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
      await api.updateStudent(id, data);
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
    <Layout>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={200}
        breakpoint="md"
        style={{
          background: '#1e293b',
          position: isMobile ? 'fixed' : 'sticky',
          zIndex: isMobile ? 1001 : 1,
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          left: isMobile ? (mobileMenuOpen ? 0 : -240) : undefined,
          transition: isMobile ? 'left 0.3s ease' : undefined
        }}
        trigger={isMobile ? null : undefined}
        collapsedWidth={isMobile ? 0 : 80}
      >
        <div style={{padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{padding: '5px', borderRadius: '6px', background: '#3b82f6', display: 'flex'}}>
              <CarFront size={16} color="white" />
            </div>
            {!collapsed && <span style={{fontWeight: 700, fontSize: '13px', color: 'white'}}>Tiện ích NVDH</span>}
          </div>
          {isMobile && (
            <X size={20} color="white" style={{cursor: 'pointer'}} onClick={() => setMobileMenuOpen(false)} />
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentMenu]}
          onClick={({key}) => {
            if (key === 'users' && !isAdmin) return;
            setCurrentMenu(key);
            if (isMobile) setMobileMenuOpen(false);
          }}
          items={[
            ...(menuVisibility.students ? [{ key: 'students', icon: <Users size={16}/>, label: 'Quản lý Học viên' }] : []),
            ...(isAdmin ? [
              ...(menuVisibility.boxes ? [{ key: 'boxes', icon: <Package size={16}/>, label: 'Hộp DAT' }] : []),
              ...(menuVisibility.instructors ? [{ key: 'instructors', icon: <UserCheck size={16}/>, label: 'Danh mục Giáo viên' }] : []),
              ...(menuVisibility.vehicles ? [{ key: 'vehicles', icon: <CarFront size={16}/>, label: 'Danh mục Xe tập' }] : []),
              ...(menuVisibility.users ? [{ key: 'users', icon: <Settings size={16}/>, label: 'Quản lý User' }] : []),
              { key: 'settings', icon: <Settings size={16}/>, label: 'Cài đặt' },
            ] : [])
          ]}
          style={{background: 'transparent', border: 'none'}}
        />
      </Sider>

      {isMobile && mobileMenuOpen && (
        <div
          style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000}}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {isMobile && !mobileMenuOpen && (
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 999,
            width: 50, height: 50, borderRadius: '25px', background: '#3b82f6',
            color: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)'
          }}
        >
          <MenuIcon size={24} />
        </button>
      )}

      <Layout>
        <Header style={{background: 'white', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', borderBottom: '1px solid #e2e8f0', boxShadow: 'none'}}>
          <div>
            <Title level={4} style={{margin:0, color: '#1e293b', fontWeight: 600}}>
              {currentMenu === 'students' ? 'Hồ sơ học viên' : currentMenu === 'instructors' ? 'Danh mục Giáo viên' : currentMenu === 'vehicles' ? 'Danh mục Xe tập' : currentMenu === 'users' ? 'Quản lý User' : currentMenu === 'settings' ? 'Cài đặt' : 'Hộp DAT'}
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
                  try {
                    const result = await api.importXML(file);
                    message.success(result.message || "Nhập XML thành công");
                    fetchData();
                  } catch (e) {
                    message.error("Lỗi nhập XML");
                  }
                }} showUploadList={false}>
                  <Button type="primary" icon={<FileUp size={16} />}> Nhập XML</Button>
                </Upload>
              </>
            )}
            <Button icon={<RefreshCw size={16} />} onClick={fetchData}>Làm mới</Button>
          </Space>
        </Header>

        <Content style={{padding: '8px', background: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)'}}>
          {currentMenu === 'students' && (
            <>
              <div className="stats-row" style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 12px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)', borderLeft: '4px solid #3b82f6', flex: 1, minWidth: '120px'}}>
                  <div style={{padding: '6px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', display: 'flex'}}><Users size={14} /></div>
                  <div>
                    <div style={{fontSize: '10px', color: '#64748b', fontWeight: 500}}>Tổng học viên</div>
                    <div style={{fontSize: '18px', fontWeight: 700, color: '#1e293b', lineHeight: 1.2}}>{filteredStudents.length}</div>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 12px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)', borderLeft: '4px solid #22c55e', flex: 1, minWidth: '120px'}}>
                  <div style={{padding: '6px', borderRadius: '8px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', display: 'flex'}}><UserCheck size={14} /></div>
                  <div>
                    <div style={{fontSize: '10px', color: '#64748b', fontWeight: 500}}>Đã Cabin</div>
                    <div style={{fontSize: '18px', fontWeight: 700, color: '#16a34a', lineHeight: 1.2}}>{filteredStudents.filter(s=>s.cabinStatus==='đã học').length}</div>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 12px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(249, 115, 22, 0.15)', borderLeft: '4px solid #f97316', flex: 1, minWidth: '120px'}}>
                  <div style={{padding: '6px', borderRadius: '8px', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', display: 'flex'}}><RefreshCw size={14} /></div>
                  <div>
                    <div style={{fontSize: '10px', color: '#64748b', fontWeight: 500}}>Chưa phân GV</div>
                    <div style={{fontSize: '18px', fontWeight: 700, color: '#ea580c', lineHeight: 1.2}}>{filteredStudents.filter(s=>!s.gvSoSan).length}</div>
                  </div>
                </div>
              </div>

              <div className="filter-row" style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
                <Input
                  placeholder="Tìm kiếm theo tên hoặc CCCD..."
                  prefix={<span style={{color: '#94a3b8'}}>🔍</span>}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{flex: 1, borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  allowClear
                />
                <Select
                  placeholder="Lọc theo lớp"
                  value={selectedClass}
                  onChange={(val) => { setSelectedClass(val); }}
                  allowClear
                  style={{width: '180px', borderRadius: '8px'}}
                  options={uniqueClasses.map(c => ({label: c, value: c}))}
                />
                {selectedClass && (
                  <Popconfirm
                    title={`Xóa toàn bộ học viên lớp "${selectedClass}"?`}
                    description="Hành động này không thể hoàn tác"
                    onConfirm={async () => {
                      try {
                        await api.deleteClass(selectedClass);
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
                  style={{width: '110px', borderRadius: '8px'}}
                  options={[
                    { label: 'Đợt 1', value: '1' },
                    { label: 'Đợt 2', value: '2' },
                    { label: 'Đợt 3', value: '3' },
                  ]}
                />
              </div>

              <Card variant="borderless" styles={{body: {padding: 0}}} style={{boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '10px', border: '1px solid #e2e8f0'}}>
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
              title={<div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><UserCheck size={16} style={{color: '#3b82f6'}}/>Danh mục Giáo viên</div>}
              variant="borderless"
              styles={{body: {padding: '12px'}}}
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px'}}
              extra={<span style={{color: '#94a3b8', fontSize: '12px'}}>{instructors.length} giáo viên</span>}
            >
              <Form layout="inline" style={{marginBottom: '12px', padding: '8px', background: '#f8fafc', borderRadius: '8px'}} onFinish={async (v)=>{await api.addInstructor(v); fetchData(); message.success('Thêm giáo viên thành công');}}>
                <Form.Item name="name" required style={{flex: 1, marginBottom: 0}}><Input placeholder="Tên giáo viên" /></Form.Item>
                <Form.Item name="type" initialValue="Số sàn" style={{marginBottom: 0, minWidth: '130px'}}><Select options={[{value:'Số sàn'}, {value:'Tự động'}]}/></Form.Item>
                <Button type="primary" htmlType="submit" icon={<Plus size={16}/>}>Thêm</Button>
              </Form>
              <Table dataSource={instructors} rowKey="id" columns={[
                {title: 'STT', render: (_, __, i) => i + 1, width: 60},
                {title: 'Họ và tên', dataIndex: 'name', width: 250, render: (t) => <span style={{fontWeight: 500}}>{t}</span>},
                {title: 'Loại đào tạo', dataIndex: 'type', render: (t) => <Tag color={t === 'Số sàn' ? 'blue' : 'orange'}>{t}</Tag>},
                {title: '', width: 60, render: (r) => <Button danger type="text" icon={<Trash2 size={16}/>} onClick={async()=>{await api.deleteInstructor(r.id); fetchData(); message.success('Đã xóa');}} />}
              ]} />
            </Card>
          )}

          {currentMenu === 'vehicles' && (
            <Card
              title={<div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><CarFront size={16} style={{color: '#f97316'}}/>Danh mục Xe tập</div>}
              variant="borderless"
              styles={{body: {padding: '12px'}}}
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px'}}
              extra={<span style={{color: '#94a3b8', fontSize: '12px'}}>{vehicles.length} xe</span>}
            >
              <Form layout="inline" style={{marginBottom: '12px', padding: '8px', background: '#f8fafc', borderRadius: '8px'}} onFinish={async (v) => {
                await api.addVehicle(v);
                message.success('Thêm xe thành công');
                fetchData();
              }}>
                <Form.Item name="plate" required style={{flex: 1, marginBottom: 0}}><Input placeholder="Biển số xe" /></Form.Item>
                <Form.Item name="type" initialValue="Số sàn" style={{marginBottom: 0, minWidth: '130px'}}><Select options={[{value:'Số sàn'}, {value:'Tự động'}]}/></Form.Item>
                <Form.Item name="donVi" initialValue="An Ninh" style={{marginBottom: 0, minWidth: '130px'}}>
                  <Select options={[{value:'An Ninh', label:'An Ninh'}, {value:'Hoàng Thịnh', label:'Hoàng Thịnh'}]}/>
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<Plus size={16}/>}>Thêm</Button>
              </Form>
              <Table dataSource={vehicles} rowKey="id" columns={[
                {title: 'STT', render: (_, __, i) => i + 1, width: 60},
                {title: 'Biển số', dataIndex: 'plate', render: (t) => <span style={{fontFamily: 'monospace', fontWeight: 600, background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px'}}>{t}</span>},
                {title: 'Loại xe', dataIndex: 'type', render: (t) => <Tag color={t === 'Số sàn' ? 'orange' : 'purple'}>{t}</Tag>},
                {title: 'Đơn vị', dataIndex: 'donVi', render: (t) => <Tag color={t === 'An Ninh' ? 'red' : 'green'}>{t}</Tag>},
                {title: '', render: (r) => <Button danger type="text" icon={<Trash2 size={16}/>} onClick={async () => { await api.deleteVehicle(r.id); fetchData(); message.success('Đã xóa'); }} />}
              ]} />
            </Card>
          )}

          {currentMenu === 'boxes' && (
            <>
              <Card
                title={<div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Package size={16} style={{color: '#8b5cf6'}}/>Hộp DAT</div>}
                variant="borderless"
                styles={{body: {padding: '12px'}}}
                style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', marginBottom: '8px'}}
                  extra={
                    <Space>
                      <Button size="small" icon={<Download size={14}/>} onClick={exportBoxesToExcel} style={{background: '#10b981', color: 'white', border: 'none'}}>Excel</Button>
                      <Button size="small" icon={<Clock size={14}/>} onClick={() => setShowHistory(true)}>Lịch sử</Button>
                      <Tag color="red">An Ninh: {vehicles.filter(v => v.donVi === 'An Ninh' && v.gvMuon).length}/{vehicles.filter(v => v.donVi === 'An Ninh').length}</Tag>
                      <Tag color="green">Hoàng Thịnh: {vehicles.filter(v => v.donVi === 'Hoàng Thịnh' && v.gvMuon).length}/{vehicles.filter(v => v.donVi === 'Hoàng Thịnh').length}</Tag>
                    </Space>
                  }
              >
                <div style={{marginBottom: '8px', display: 'flex', gap: '8px'}}>
                  <Card size="small" style={{flex: 1, background: '#fef2f2', border: '1px solid #fecaca'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Tag color="red">An Ninh</Tag>
                      <span style={{fontWeight: 600, color: '#dc2626'}}>{vehicles.filter(v => v.donVi === 'An Ninh').length} hộp</span>
                      <span style={{color: '#64748b', fontSize: '12px'}}>
                        ({vehicles.filter(v => v.donVi === 'An Ninh' && v.gvMuon).length} đang mượn)
                      </span>
                    </div>
                  </Card>
                  <Card size="small" style={{flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Tag color="green">Hoàng Thịnh</Tag>
                      <span style={{fontWeight: 600, color: '#16a34a'}}>{vehicles.filter(v => v.donVi === 'Hoàng Thịnh').length} hộp</span>
                      <span style={{color: '#64748b', fontSize: '12px'}}>
                        ({vehicles.filter(v => v.donVi === 'Hoàng Thịnh' && v.gvMuon).length} đang mượn)
                      </span>
                    </div>
                  </Card>
                </div>

                <div style={{marginBottom: '8px', display: 'flex', gap: '6px'}}>
                  <Button
                    type={activeTab === 'an_ninh' ? 'primary' : 'default'}
                    onClick={() => setActiveTab('an_ninh')}
                    style={{background: activeTab === 'an_ninh' ? '#dc2626' : undefined}}
                  >
                    <Tag color="red">An Ninh</Tag> {vehicles.filter(v => v.donVi === 'An Ninh').length} hộp
                  </Button>
                  <Button
                    type={activeTab === 'hoang_thinh' ? 'primary' : 'default'}
                    onClick={() => setActiveTab('hoang_thinh')}
                    style={{background: activeTab === 'hoang_thinh' ? '#16a34a' : undefined}}
                  >
                    <Tag color="green">Hoàng Thịnh</Tag> {vehicles.filter(v => v.donVi === 'Hoàng Thịnh').length} hộp
                  </Button>
                </div>

                <Input
                  placeholder="Tìm biển số hộp..."
                  value={boxSearchText}
                  onChange={(e) => setBoxSearchText(e.target.value)}
                  style={{marginBottom: '8px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  allowClear
                />

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px'}}>
                  {(activeTab === 'an_ninh'
                    ? vehicles.filter(v => v.donVi === 'An Ninh')
                    : vehicles.filter(v => v.donVi === 'Hoàng Thịnh')
                  ).filter(v => !boxSearchText || v.plate.toLowerCase().includes(boxSearchText.toLowerCase())).map(v => (
                    <div key={v.id} style={{
                      position: 'relative',
                      padding: '12px',
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

              <Modal
                title="Lịch sử mượn/trả hộp"
                open={showHistory}
                onCancel={() => setShowHistory(false)}
                footer={<Button danger onClick={() => { saveHistory([]); api.clearBoxHistory().catch(() => {}); message.success('Đã xóa lịch sử'); }}>Xóa lịch sử</Button>}
                width={900}
              >
                <Table
                  dataSource={boxHistory}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 15, showTotal: (t) => `${t} lượt` }}
                  columns={[
                    {title: 'STT', render: (_, __, i) => i + 1, width: 50},
                    {title: 'Biển số', dataIndex: 'plate', width: 120, render: (t) => <span style={{fontFamily: 'monospace', fontWeight: 600}}>{formatPlate(t)}</span>},
                    {title: 'Đơn vị', dataIndex: 'donVi', width: 110, render: (t) => <Tag color={t === 'An Ninh' ? 'red' : 'green'}>{t}</Tag>},
                    {title: 'Giáo viên', dataIndex: 'gvMuon', width: 150},
                    {title: 'Ngày mượn', dataIndex: 'ngayMuon', width: 150},
                    {title: 'Ngày trả', dataIndex: 'ngayTra', width: 150, render: (t) => t || '-'},
                    {title: 'Hành động', dataIndex: 'action', width: 90, render: (t) => <Tag color={t === 'mượn' ? 'orange' : 'green'}>{t === 'mượn' ? 'Mượn' : 'Trả'}</Tag>},
                    {title: 'Ghi nhận', dataIndex: 'createdAt', width: 150},
                  ]}
                />
              </Modal>
            </>
          )}

          {currentMenu === 'users' && isAdmin && (
            <Card
              title={<div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Settings size={16} style={{color: '#3b82f6'}}/>Quản lý User</div>}
              variant="borderless"
              styles={{body: {padding: '12px'}}}
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px'}}
              extra={<span style={{color: '#94a3b8', fontSize: '12px'}}>{users.length} user</span>}
            >
              <Form layout="inline" style={{marginBottom: '12px', padding: '8px', background: '#f8fafc', borderRadius: '8px'}} onFinish={addUser}>
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
                  <Popconfirm title="Xóa user này?" onConfirm={async () => { await api.deleteUser(r.id); fetchUsers(); message.success('Đã xóa'); }}>
                    <Button danger type="text" icon={<Trash2 size={16}/>} />
                  </Popconfirm>
                )}
              ]} />
            </Card>
          )}

          {currentMenu === 'settings' && isAdmin && (
            <Card
              title={<div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Settings size={16} style={{color: '#64748b'}}/>Cài đặt hiển thị menu</div>}
              variant="borderless"
              styles={{body: {padding: '16px'}}}
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px'}}
            >
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {[
                  { key: 'students', label: 'Quản lý Học viên' },
                  { key: 'boxes', label: 'Hộp DAT' },
                  { key: 'instructors', label: 'Danh mục Giáo viên' },
                  { key: 'vehicles', label: 'Danh mục Xe tập' },
                  { key: 'users', label: 'Quản lý User' },
                ].map(item => (
                  <div key={item.key} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px'}}>
                    <span style={{fontWeight: 500, color: '#1e293b'}}>{item.label}</span>
                    <Button
                      type={menuVisibility[item.key] ? 'primary' : 'default'}
                      danger={!menuVisibility[item.key]}
                      onClick={() => saveMenuVisibility({ ...menuVisibility, [item.key]: !menuVisibility[item.key] })}
                      style={{minWidth: 80}}
                    >
                      {menuVisibility[item.key] ? 'Hiện' : 'Ẩn'}
                    </Button>
                  </div>
                ))}
              </div>
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
