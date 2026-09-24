# GIS PWA5 — Vercel + Node.js Serverless + MongoDB Atlas

## เป้าหมาย
ผู้ใช้เปิด Dashboard จากเครื่องใดก็ได้ผ่าน HTTPS โดยไม่ต้องติดตั้ง Node.js ที่เครื่องผู้ใช้ และไม่ต้องเปิด PC ของผู้พัฒนาทิ้งไว้หลัง Deploy

## โครงสร้าง
- `public/index.html` Dashboard ตัวอย่าง
- `api/*.js` Serverless API
- `lib/mongodb.js` MongoDB connection/cache
- `lib/api.js` validation, filtering, field normalization
- `.env.example` ตัวอย่าง environment variables
- `vercel.json` ตั้งค่า Vercel Functions

## ขั้นตอน 1: ตรวจ MongoDB Atlas
ต้องรู้ 4 อย่าง:
1. Cluster
2. Database name
3. Collection name
4. ชื่อ field จริงใน document

ตัวอย่าง schema ที่โค้ดรองรับ:
```json
{
  "fiscal_year": 2569,
  "quarter": 3,
  "branch": {"code":"5552090","name":"สงขลา"},
  "metrics": {
    "customer_count": 10000,
    "imported_customer_count": 9800,
    "pipe_length_m": 123456,
    "valve_count": 500,
    "fire_hydrant_count": 80,
    "leak_point_count": 20
  }
}
```
และรูปแบบ flat เช่น `branch_code`, `branch_name`, `customer_count` เป็นต้น

ถ้าฐานข้อมูลจริงใช้ field อื่น ให้แก้ `lib/api.js` ก่อนใช้งานจริง

## ขั้นตอน 2: ติดตั้ง Node.js
ติดตั้ง Node.js LTS แล้วเปิด CMD ในโฟลเดอร์โปรเจกต์:
```bash
npm install
```

## ขั้นตอน 3: ตั้งค่า local
คัดลอก `.env.example` เป็น `.env` แล้วใส่:
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=ชื่อ_database_จริง
MONGODB_COLLECTION=ชื่อ_collection_จริง
API_KEY=
CORS_ORIGIN=
```
อย่าใส่ `.env` ใน GitHub

ทดสอบ:
```bash
npm run dev
```
เปิด:
- http://localhost:3000
- http://localhost:3000/api/health
- http://localhost:3000/api/periods

## ขั้นตอน 4: GitHub
สร้าง repository เช่น `gis-pwa5`
อัปโหลดไฟล์ทั้งหมด ยกเว้น `.env` และ `node_modules`

## ขั้นตอน 5: Vercel
1. เข้า Vercel
2. Add New > Project
3. Import Git Repository
4. เลือก `gis-pwa5`
5. Deploy
6. Project > Settings > Environment Variables
7. เพิ่ม `MONGODB_URI`, `MONGODB_DB`, `MONGODB_COLLECTION`
8. Save แล้ว Redeploy

Vercel จะรันไฟล์ใน `api/` เป็น Serverless Functions และ `public/` เป็น static files

## ขั้นตอน 6: MongoDB Atlas Network Access
ต้องตั้งค่าให้ Vercel เชื่อมต่อ Atlas ได้ตามรูปแบบ deployment ที่เลือก
หากใช้ Vercel dynamic IPs ให้ตรวจวิธี IP Access List ของ Atlas สำหรับ Vercel และความเสี่ยงของการอนุญาต `0.0.0.0/0`
อย่าเปิดกว้างโดยไม่เข้าใจผลด้านความปลอดภัย

## ขั้นตอน 7: ทดสอบหลัง Deploy
สมมติ URL:
`https://gis-pwa5.vercel.app`

เปิด:
- `/`
- `/api/health`
- `/api/periods`
- `/api/history`
- `/api/branches?year=2569&quarter=3`
- `/api/dashboard?year=2569&quarter=3`
- `/api/summary?year=2569&quarter=3`

## ขั้นตอน 8: ปี 2565–2569
`/api/periods` ตรวจทุกปี 2565-2569 และ Q1-Q4
ถ้าไม่มีข้อมูล count=0 และ hasData=false
ไม่มีการสร้างข้อมูลสุ่ม

## ขั้นตอน 9: เรื่องกระบี่
Dashboard ไม่ hard-code รายชื่อสาขา `branches` อ่านจาก MongoDB จริง ดังนั้นถ้า MongoDB ไม่มีเอกสารของกระบี่ในช่วงที่เลือก จะไม่สร้างกระบี่ขึ้นมาเอง

## ขั้นตอน 10: ความปลอดภัย
- MongoDB URI อยู่ใน Vercel Environment Variables ไม่อยู่ใน HTML
- ใช้ Database User ที่สิทธิ์ต่ำที่สุดเท่าที่จำเป็น เช่น read-only สำหรับ Dashboard
- ไม่ commit `.env`
- ใช้ HTTPS
- ถ้าเป็นข้อมูลภายในองค์กร ควรเพิ่ม Login/SSO หรือการควบคุมสิทธิ์
- อย่าใส่ API_KEY ลง JavaScript ฝั่ง browser เพราะผู้ใช้จะเห็น key ได้

## API
### Health
`GET /api/health`

### Dashboard
`GET /api/dashboard?year=2569&quarter=3&branch=สงขลา`
หรือ `branchCode=...`

### Branches
`GET /api/branches?year=2569&quarter=3`

### Periods
`GET /api/periods`

### Summary
`GET /api/summary?year=2569&quarter=3`

## สถาปัตยกรรมสุดท้าย
Browser -> Vercel Static Dashboard -> Vercel Serverless API -> MongoDB Atlas

เครื่องผู้ใช้ไม่ต้องติดตั้ง Node.js และเครื่องพัฒนาไม่ต้องเปิดทิ้งไว้หลัง Deploy
