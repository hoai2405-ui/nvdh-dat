const mockStudents = [
  { id: 1, stt: 1, fullName: 'Nguyễn Văn A', dob: '2000', cccd: '012345678901', address: 'Hà Nội', cabinStatus: 'chưa học', gvSoSan: '', xeSoSan: '', gvTuDong: '', xeTuDong: '', ngayDat: '', huongDan: '' },
  { id: 2, stt: 2, fullName: 'Trần Thị B', dob: '2001', cccd: '012345678902', address: 'HCM', cabinStatus: 'đã học', gvSoSan: 'GV A', xeSoSan: '12A-1234', gvTuDong: '', xeTuDong: '', ngayDat: '', huongDan: '' },
  { id: 3, stt: 3, fullName: 'Lê Văn C', dob: '1999', cccd: '012345678903', address: 'Đà Nẵng', cabinStatus: 'chưa học', gvSoSan: '', xeSoSan: '', gvTuDong: '', xeTuDong: '', ngayDat: '', huongDan: '' },
];

const mockClasses = ['12A1', '12A2', '12A3'];

const mockBoxes = [
  { id: 1, name: 'Hộp 1', status: 'trong', gvMuon: '', ngayMuon: '', gvTra: '', ngayTra: '' },
  { id: 2, name: 'Hộp 2', status: 'trong', gvMuon: '', ngayMuon: '', gvTra: '', ngayTra: '' },
  { id: 3, name: 'Hộp 3', status: 'dang_muon', gvMuon: 'GV Minh', ngayMuon: '09/04/2026 10:00', gvTra: '', ngayTra: '' },
  { id: 4, name: 'Hộp 4', status: 'trong', gvMuon: '', ngayMuon: '', gvTra: '', ngayTra: '' },
  { id: 5, name: 'Hộp 5', status: 'trong', gvMuon: '', ngayMuon: '', gvTra: '', ngayTra: '' },
];

const mockInstructors = [
  { id: 1, name: 'GV Minh', phone: '0912345678' },
  { id: 2, name: 'GV Hùng', phone: '0912345679' },
  { id: 3, name: 'GV Lan', phone: '0912345680' },
];

const mockVehicles = [
  { id: 1, plate: '51F9-0905', type: 'An ninh' },
  { id: 2, plate: '80A0-0074', type: 'An ninh' },
  { id: 3, plate: '80A0-0159', type: 'An ninh' },
  { id: 4, plate: '80A0-0156', type: 'An ninh' },
  { id: 5, plate: '80A0-0110', type: 'An ninh' },
  { id: 6, plate: '51F9-1212', type: 'An ninh' },
  { id: 7, plate: '51F9-0815', type: 'An ninh' },
  { id: 8, plate: '80A0-0057', type: 'An ninh' },
  { id: 9, plate: '80A0-0132', type: 'An ninh' },
  { id: 10, plate: '51F9-0852', type: 'An ninh' },
  { id: 11, plate: '80A0-0111', type: 'An ninh' },
  { id: 12, plate: '80A0-0117', type: 'An ninh' },
  { id: 13, plate: '80A0-0183', type: 'An ninh' },
  { id: 14, plate: '80A0-0155', type: 'An ninh' },
  { id: 15, plate: '80A0-0126', type: 'An ninh' },
  { id: 16, plate: '80A0-0139', type: 'An ninh' },
  { id: 17, plate: '80A0-0160', type: 'An ninh' },
  { id: 18, plate: '51F2-9832', type: 'An ninh' },
  { id: 19, plate: '51F2-9795', type: 'An ninh' },
  { id: 20, plate: '51F2-9550', type: 'An ninh' },
  { id: 21, plate: '51F2-9211', type: 'An ninh' },
  { id: 22, plate: '51F2-9072', type: 'An ninh' },
  { id: 23, plate: '51F2-9340', type: 'An ninh' },
  { id: 24, plate: '51F2-9790', type: 'An ninh' },
  { id: 25, plate: '51F2-9817', type: 'An ninh' },
  { id: 26, plate: '51F2-9887', type: 'An ninh' },
  { id: 27, plate: '51F2-9945', type: 'An ninh' },
  { id: 28, plate: '51F2-9765', type: 'An ninh' },
  { id: 29, plate: '51F2-9723', type: 'An ninh' },
  { id: 30, plate: '51F2-9819', type: 'An ninh' },
  { id: 31, plate: '51F2-9839', type: 'An ninh' },
  { id: 32, plate: '51F2-9859', type: 'An ninh' },
  { id: 33, plate: '51F2-9341', type: 'An ninh' },
  { id: 34, plate: '51F2-9400', type: 'An ninh' },
  { id: 35, plate: '51F2-9294', type: 'An ninh' },
  { id: 36, plate: '51F2-9827', type: 'An ninh' },
  { id: 37, plate: '80A0-0171', type: 'An ninh' },
  { id: 38, plate: '80A0-0150', type: 'An ninh' },
  { id: 39, plate: '80A0-0163', type: 'An ninh' },
  { id: 40, plate: '80A0-0102', type: 'An ninh' },
  { id: 41, plate: '80A0-0149', type: 'An ninh' },
  { id: 42, plate: '80A0-0185', type: 'An ninh' },
  { id: 43, plate: '80A0-0133', type: 'An ninh' },
  { id: 44, plate: '51F2-9418', type: 'An ninh' },
  { id: 45, plate: '51F2-9427', type: 'An ninh' },
  { id: 46, plate: '51F2-9190', type: 'An ninh' },
  { id: 47, plate: '51F2-9332', type: 'An ninh' },
  { id: 48, plate: '51G0-1358', type: 'Hoàng Thịnh' },
  { id: 49, plate: '51G0-0298', type: 'Hoàng Thịnh' },
  { id: 50, plate: '51G0-0779', type: 'Hoàng Thịnh' },
  { id: 51, plate: '51G0-1390', type: 'Hoàng Thịnh' },
  { id: 52, plate: '51G0-1410', type: 'Hoàng Thịnh' },
  { id: 53, plate: '51G0-0885', type: 'Hoàng Thịnh' },
  { id: 54, plate: '51G0-0839', type: 'Hoàng Thịnh' },
  { id: 55, plate: '51G0-0907', type: 'Hoàng Thịnh' },
  { id: 56, plate: '51G0-1382', type: 'Hoàng Thịnh' },
  { id: 57, plate: '51G0-1081', type: 'Hoàng Thịnh' },
  { id: 58, plate: '51G0-1579', type: 'Hoàng Thịnh' },
  { id: 59, plate: '51G0-1577', type: 'Hoàng Thịnh' },
  { id: 60, plate: '51G0-1461', type: 'Hoàng Thịnh' },
  { id: 61, plate: '51G0-1481', type: 'Hoàng Thịnh' },
  { id: 62, plate: '51G0-1601', type: 'Hoàng Thịnh' },
  { id: 63, plate: '51G0-1662', type: 'Hoàng Thịnh' },
  { id: 64, plate: '51G0-1660', type: 'Hoàng Thịnh' },
  { id: 65, plate: '51G0-1311', type: 'Hoàng Thịnh' },
  { id: 66, plate: '51G0-1733', type: 'Hoàng Thịnh' },
  { id: 67, plate: '51G0-0233', type: 'Hoàng Thịnh' },
  { id: 68, plate: '51G0-1792', type: 'Hoàng Thịnh' },
  { id: 69, plate: '51G0-1557', type: 'Hoàng Thịnh' },
  { id: 70, plate: '51G0-1558', type: 'Hoàng Thịnh' },
  { id: 71, plate: '51G0-1740', type: 'Hoàng Thịnh' },
  { id: 72, plate: '51G0-1838', type: 'Hoàng Thịnh' },
  { id: 73, plate: '51G0-1911', type: 'Hoàng Thịnh' },
  { id: 74, plate: '51G0-1876', type: 'Hoàng Thịnh' },
  { id: 75, plate: '51G0-1331', type: 'Hoàng Thịnh' },
  { id: 76, plate: '51G0-1881', type: 'Hoàng Thịnh' },
  { id: 77, plate: '51G0-1926', type: 'Hoàng Thịnh' },
  { id: 78, plate: '51F2-9834', type: 'Hoàng Thịnh' },
  { id: 79, plate: '51F2-9297', type: 'Hoàng Thịnh' },
  { id: 80, plate: '51F2-9138', type: 'Hoàng Thịnh' },
  { id: 81, plate: '51F2-9384', type: 'Hoàng Thịnh' },
  { id: 82, plate: '51F2-9442', type: 'Hoàng Thịnh' },
  { id: 83, plate: '51F2-9720', type: 'Hoàng Thịnh' },
  { id: 84, plate: '51F2-9731', type: 'Hoàng Thịnh' },
  { id: 85, plate: '51F2-9200', type: 'Hoàng Thịnh' },
  { id: 86, plate: '51F2-9744', type: 'Hoàng Thịnh' },
  { id: 87, plate: '51K6-0460', type: 'Hoàng Thịnh' },
  { id: 88, plate: '51K6-0299', type: 'Hoàng Thịnh' },
  { id: 89, plate: '51K6-0309', type: 'Hoàng Thịnh' },
  { id: 90, plate: '51K6-0053', type: 'Hoàng Thịnh' },
  { id: 91, plate: '51K6-0331', type: 'Hoàng Thịnh' },
  { id: 92, plate: '51K6-0136', type: 'Hoàng Thịnh' },
  { id: 93, plate: '51K6-0195', type: 'Hoàng Thịnh' },
  { id: 94, plate: '51K6-0015', type: 'Hoàng Thịnh' },
  { id: 95, plate: '51K6-0495', type: 'Hoàng Thịnh' },
  { id: 96, plate: '51K6-0091', type: 'Hoàng Thịnh' },
  { id: 97, plate: '51K6-0361', type: 'Hoàng Thịnh' },
  { id: 98, plate: '51K6-0358', type: 'Hoàng Thịnh' },
  { id: 99, plate: '51K6-0119', type: 'Hoàng Thịnh' },
  { id: 100, plate: '51K6-0425', type: 'Hoàng Thịnh' },
  { id: 101, plate: '51K6-0100', type: 'Hoàng Thịnh' },
  { id: 102, plate: '51K6-0124', type: 'Hoàng Thịnh' },
  { id: 103, plate: '51K6-0169', type: 'Hoàng Thịnh' },
  { id: 104, plate: '51K6-0269', type: 'Hoàng Thịnh' },
  { id: 105, plate: '51K6-0320', type: 'Hoàng Thịnh' },
  { id: 106, plate: '51F6-0337', type: 'Hoàng Thịnh' },
];

const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' },
  { id: 2, username: 'user', password: 'user123', role: 'user', name: 'Nhân viên' },
];

export const api = {
  login: (values) => {
    const user = mockUsers.find(u => u.username === values.username && u.password === values.password);
    if (user) return Promise.resolve({ data: user });
    return Promise.reject({ response: { data: { error: 'Tài khoản hoặc mật khẩu không đúng' } } });
  },

  getStudents: (className) => 
    Promise.resolve({ data: mockStudents }),
  
  getClasses: () => 
    Promise.resolve({ data: mockClasses }),
  
  updateStudent: (id, data) => {
    const idx = mockStudents.findIndex(s => s.id === id);
    if (idx > -1) Object.assign(mockStudents[idx], data);
    return Promise.resolve({ data: true });
  },
  
  bulkUpdate: (ids, data) => {
    ids.forEach(id => {
      const idx = mockStudents.findIndex(s => s.id === id);
      if (idx > -1) Object.assign(mockStudents[idx], data);
    });
    return Promise.resolve({ data: true });
  },
  
  importXML: (file) => Promise.resolve({ data: { success: true } }),

  getBoxes: () => Promise.resolve({ data: mockBoxes }),
  addBox: (data) => {
    const newId = mockBoxes.length + 1;
    mockBoxes.push({ ...data, id: newId, status: 'trong', gvMuon: '', ngayMuon: '', gvTra: '', ngayTra: '' });
    return Promise.resolve({ data: { id: newId } });
  },
  updateBox: (id, data) => {
    const idx = mockBoxes.findIndex(b => b.id === id);
    if (idx > -1) Object.assign(mockBoxes[idx], data);
    return Promise.resolve({ data: true });
  },
  deleteBox: (id) => {
    const idx = mockBoxes.findIndex(b => b.id === id);
    if (idx > -1) mockBoxes.splice(idx, 1);
    return Promise.resolve({ data: true });
  },

  getInstructors: () => Promise.resolve({ data: mockInstructors }),
  addInstructor: (data) => {
    const newId = mockInstructors.length + 1;
    mockInstructors.push({ ...data, id: newId });
    return Promise.resolve({ data: { id: newId } });
  },
  deleteInstructor: (id) => {
    const idx = mockInstructors.findIndex(i => i.id === id);
    if (idx > -1) mockInstructors.splice(idx, 1);
    return Promise.resolve({ data: true });
  },

  getVehicles: () => Promise.resolve({ data: mockVehicles }),
  addVehicle: (data) => {
    const newId = mockVehicles.length + 1;
    mockVehicles.push({ ...data, id: newId });
    return Promise.resolve({ data: { id: newId } });
  },
  deleteVehicle: (id) => {
    const idx = mockVehicles.findIndex(v => v.id === id);
    if (idx > -1) mockVehicles.splice(idx, 1);
    return Promise.resolve({ data: true });
  },

  getUsers: () => Promise.resolve({ data: mockUsers }),
};
