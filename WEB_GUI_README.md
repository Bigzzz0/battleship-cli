# Battleship Web GUI - คำแนะนำการใช้งาน

## ภาพรวมโปรเจกต์

โปรเจกต์นี้เป็นเกมเรือรบ (Battleship) ที่พัฒนาเป็น Web Application โดยใช้:
- **Frontend**: React + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: In-memory storage
- **Deployment**: Docker + Docker Compose

## ฟีเจอร์หลัก

### 🎮 การเล่นเกม
- กระดานเกม 10x10 พร้อมระบบพิกัด A-J และ 1-10
- การยิงโดยคลิกที่ช่องในกระดาน
- แสดงผลลัพธ์: 💥 (Hit), 💧 (Miss)
- ข้อความแจ้งสถานะเกมแบบ real-time

### 📊 สถิติและการติดตาม
- จำนวนการยิงทั้งหมด
- จำนวนการโดนเป้า
- อัตราการโดนเป้า (Hit Rate)
- จำนวนเรือที่เหลือ
- สถานะการชนะ

### 🔧 โหมด Debug
- แสดงตำแหน่งเรือทั้งหมดด้วยไอคอน 🚢
- เหมาะสำหรับการทดสอบและพัฒนา
- สามารถเปิด/ปิดได้ตลอดเวลา

## การติดตั้งและรัน

### วิธีที่ 1: ใช้ Docker (แนะนำ)

```bash
# 1. Clone หรือ extract โปรเจกต์
cd battleship-project

# 2. รัน Backend และ Frontend พร้อมกัน
docker-compose up --build

# 3. เปิดเบราว์เซอร์ไปที่:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
```

### วิธีที่ 2: รันแยกส่วน

#### Backend (FastAPI)
```bash
# 1. ติดตั้ง dependencies
pip install -r requirements.txt

# 2. รัน FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# API จะพร้อมใช้งานที่ http://localhost:8000
```

#### Frontend (React)
```bash
# 1. เข้าไปในโฟลเดอร์ frontend
cd battleship-frontend

# 2. ติดตั้ง dependencies
pnpm install

# 3. รัน development server
pnpm run dev

# หรือ build สำหรับ production
pnpm run build
pnpm run preview
```

## API Endpoints

### Backend API
- `GET /` - ข้อมูลพื้นฐานของ API
- `POST /games` - สร้างเกมใหม่
- `GET /games/{game_id}` - ดูสถานะเกม
- `GET /games/{game_id}/debug` - ดูสถานะเกมพร้อมตำแหน่งเรือ (Debug Mode)
- `POST /games/{game_id}/fire` - ยิงที่ตำแหน่งที่กำหนด

### ตัวอย่างการใช้งาน API

```bash
# สร้างเกมใหม่
curl -X POST http://localhost:8000/games

# ยิงที่ตำแหน่ง A1
curl -X POST http://localhost:8000/games/{game_id}/fire \
  -H "Content-Type: application/json" \
  -d '{"position": "A1"}'

# ดูสถานะเกม
curl http://localhost:8000/games/{game_id}

# ดูสถานะเกมแบบ Debug
curl http://localhost:8000/games/{game_id}/debug
```

## โครงสร้างโปรเจกต์

```
battleship-project/
├── app/                          # Backend (FastAPI)
│   ├── core/
│   │   └── utils.py             # Utility functions
│   ├── models/
│   │   └── board.py             # Board model และ game logic
│   ├── services/
│   │   └── game_service.py      # Game service layer
│   └── main.py                  # FastAPI application
├── battleship-frontend/         # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameBoard.jsx    # กระดานเกม
│   │   │   ├── GameStats.jsx    # สถิติเกม
│   │   │   └── ui/              # UI components (shadcn/ui)
│   │   ├── App.jsx              # Main application
│   │   └── main.jsx             # Entry point
│   ├── dist/                    # Built files สำหรับ production
│   └── package.json
├── Dockerfile                   # Docker configuration
├── docker-compose.yml           # Docker Compose setup
├── requirements.txt             # Python dependencies
└── README.md                    # คำแนะนำทั่วไป
```

## การพัฒนาต่อ

### เพิ่มฟีเจอร์ใหม่
1. **Multiplayer Mode**: เพิ่มการเล่นหลายคน
2. **AI Opponent**: เพิ่มคู่ต่อสู้ AI
3. **Game History**: บันทึกประวัติการเล่น
4. **Custom Ship Placement**: ให้ผู้เล่นวางเรือเอง
5. **Sound Effects**: เพิ่มเสียงประกอบ

### การปรับแต่ง UI/UX
- เปลี่ยนธีมสี
- เพิ่มแอนิเมชัน
- ปรับปรุง responsive design
- เพิ่มการแจ้งเตือน (notifications)

### การปรับปรุงประสิทธิภาพ
- เพิ่ม Redis สำหรับ session storage
- เพิ่ม database สำหรับ persistent data
- เพิ่ม WebSocket สำหรับ real-time updates
- เพิ่ม authentication และ user management

## การ Deploy

### Production Deployment
```bash
# Build React app
cd battleship-frontend
pnpm run build

# Deploy ด้วย Docker
docker-compose -f docker-compose.prod.yml up --build -d
```

### Environment Variables
สร้างไฟล์ `.env` สำหรับการตั้งค่า:
```
# Backend
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Frontend
VITE_API_BASE_URL=http://localhost:8000
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **CORS Error**
   - ตรวจสอบว่า Backend เปิด CORS สำหรับ Frontend domain
   - ตรวจสอบ `VITE_API_BASE_URL` ใน Frontend

2. **API Connection Failed**
   - ตรวจสอบว่า Backend รันอยู่ที่ port 8000
   - ตรวจสอบ firewall และ network settings

3. **Frontend ไม่แสดงผล**
   - ตรวจสอบ console errors ในเบราว์เซอร์
   - ตรวจสอบว่า dependencies ติดตั้งครบถ้วน

4. **Docker Issues**
   - ตรวจสอบว่า Docker และ Docker Compose ติดตั้งแล้ว
   - ลองรัน `docker-compose down` แล้ว `docker-compose up --build`

## การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ logs ใน console/terminal
2. ดู API documentation ที่ http://localhost:8000/docs
3. ตรวจสอบ network และ port conflicts

---

**หมายเหตุ**: โปรเจกต์นี้พัฒนาสำหรับการศึกษาและการทดสอบ เหมาะสำหรับการพัฒนาต่อยอดและปรับแต่งตามความต้องการ

