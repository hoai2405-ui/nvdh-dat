const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { XMLParser } = require('fast-xml-parser');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const upload = multer();

prisma.$connect().then(async () => {
    const count = await prisma.user.count();
    if (count === 0) {
        await prisma.user.create({
            data: { username: "admin", password: "123456", role: "admin" }
        });
        console.log("✅ Created default admin user");
    }
});

app.use(cors({
    origin: ['http://localhost:5173', 'https://nvdh.netlify.app'],
    credentials: true
}));
app.use(express.json());

// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
    }
    res.json({ id: user.id, username: user.username, role: user.role });
});

app.post('/api/auth/register', async (req, res) => {
    const { username, password, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: "Tài khoản đã tồn tại" });
    const user = await prisma.user.create({ data: { username, password, role: role || "staff" } });
    res.json({ id: user.id, username: user.username, role: user.role });
});

app.get('/api/auth/users', async (req, res) => {
    const users = await prisma.user.findMany({ select: { id: true, username: true, role: true } });
    res.json(users);
});

app.delete('/api/auth/users/:id', async (req, res) => {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Deleted" });
});

// --- DANH MỤC GIÁO VIÊN ---
app.get('/api/instructors', async (req, res) => {
    const data = await prisma.instructor.findMany();
    res.json(data);
});
app.post('/api/instructors', async (req, res) => {
    const data = await prisma.instructor.create({ data: req.body });
    res.json(data);
});
app.delete('/api/instructors/:id', async (req, res) => {
    await prisma.instructor.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Deleted" });
});

// --- DANH MỤC XE ---
app.get('/api/vehicles', async (req, res) => {
    const data = await prisma.vehicle.findMany();
    res.json(data);
});
app.post('/api/vehicles', async (req, res) => {
    const data = await prisma.vehicle.create({ data: req.body });
    res.json(data);
});
app.delete('/api/vehicles/:id', async (req, res) => {
    await prisma.vehicle.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Deleted" });
});

// --- HỌC VIÊN ---
app.get('/api/students', async (req, res) => {
    const data = await prisma.student.findMany({ orderBy: { id: 'desc' } });
    res.json(data);
});

app.patch('/api/students/:id', async (req, res) => {
    const data = await prisma.student.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
    });
    res.json(data);
});

app.delete('/api/students/class/:className', async (req, res) => {
    await prisma.student.deleteMany({
        where: { className: req.params.className }
    });
    res.json({ message: "Đã xóa khóa học" });
});

// --- HỘP DAT ---
app.get('/api/boxes', async (req, res) => {
    const data = await prisma.box.findMany({ orderBy: { id: 'asc' } });
    res.json(data);
});
app.post('/api/boxes', async (req, res) => {
    const data = await prisma.box.create({ data: req.body });
    res.json(data);
});
app.patch('/api/boxes/:id', async (req, res) => {
    const data = await prisma.box.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
    });
    res.json(data);
});
app.delete('/api/boxes/:id', async (req, res) => {
    await prisma.box.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Deleted" });
});

// --- NHẬP XML ---
app.post('/api/import-xml', upload.single('file'), async (req, res) => {
    try {
        const xmlData = req.file.buffer.toString();
        const parser = new XMLParser({ ignoreAttributes: false });
        const jsonObj = parser.parse(xmlData);

        const classInfo = jsonObj.BAO_CAO1?.DATA?.KHOA_HOC?.TEN_KHOA_HOC || "Khóa học";
        let rawStudents = jsonObj.BAO_CAO1?.DATA?.NGUOI_LXS?.NGUOI_LX || [];
        if (!Array.isArray(rawStudents)) rawStudents = [rawStudents];

        const studentsToUpsert = rawStudents
            .filter(s => s.SO_CMT)
            .map(s => ({
                cccd: String(s.SO_CMT),
                fullName: s.HO_VA_TEN,
                dob: s.NGAY_SINH ? String(s.NGAY_SINH) : "",
                address: s.NOI_TT || "",
                className: classInfo
            }));

        if (studentsToUpsert.length === 0) {
            return res.json({ message: "Không có dữ liệu" });
        }

        const cccds = studentsToUpsert.map(s => s.cccd);
        const existing = await prisma.student.findMany({
            where: { cccd: { in: cccds } },
            select: { cccd: true }
        });
        const existingSet = new Set(existing.map(e => e.cccd));

        const toCreate = studentsToUpsert.filter(s => !existingSet.has(s.cccd));
        const toUpdate = studentsToUpsert.filter(s => existingSet.has(s.cccd));

        if (toCreate.length > 0) {
            await prisma.student.createMany({ data: toCreate, skipDuplicates: true });
        }

        await Promise.all(toUpdate.map(s => 
            prisma.student.update({
                where: { cccd: s.cccd },
                data: { fullName: s.fullName, className: s.className }
            })
        ));

        res.json({ message: `Đã import ${studentsToUpsert.length} học viên` });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Lỗi file" });
    }
});

app.listen(5000, () => console.log("Server chạy tại port 5000"));