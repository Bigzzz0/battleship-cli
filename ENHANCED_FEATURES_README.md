# 🚢 Battleship Game - Enhanced Features

## 🎯 ฟีเจอร์ใหม่ที่เพิ่มเข้ามา

### 1. 🤖 AI Opponent
- **คู่ต่อสู้ AI อัจฉริยะ** ที่สามารถยิงโต้ตอบกับผู้เล่น
- **AI Strategy**: ใช้กลยุทธ์การยิงแบบสุ่มและการติดตามเป้าหมาย
- **Real-time Battle**: ผู้เล่นและ AI สามารถยิงสลับกันได้

### 2. 📊 Game History & Statistics
- **บันทึกประวัติการยิง** ทุกครั้งพร้อมผลลัพธ์
- **สถิติเกม** แสดงข้อมูล:
  - จำนวนช็อตทั้งหมด
  - อัตราการโดนเป้า (Hit Rate)
  - ระยะเวลาการเล่น
  - ผู้ชนะ (Player หรือ AI)
- **Timeline View** แสดงลำดับการยิงของทั้งสองฝ่าย

### 3. 🎯 Custom Ship Placement
- **วางเรือด้วยตนเอง** แทนการสุ่ม
- **Interactive UI** สำหรับการเลือกตำแหน่งและทิศทาง
- **Real-time Validation** ตรวจสอบการวางเรือทันที
- **Visual Preview** แสดงตัวอย่างการวางเรือ
- **Ship Management** ลบและแก้ไขตำแหน่งเรือได้

### 4. 🔊 Sound Effects
- **เสียงประกอบเกม** ที่สมจริง:
  - 💥 Hit Sound - เสียงเมื่อโดนเป้า
  - 💧 Miss Sound - เสียงเมื่อพลาดเป้า
  - 🚢 Ship Sunk - เสียงเมื่อเรือจม
  - 🎉 Win/Lose - เสียงเมื่อชนะ/แพ้
  - 🤖 AI Shot - เสียงเมื่อ AI ยิง
  - 🎮 New Game - เสียงเริ่มเกมใหม่
- **Sound Toggle** เปิด/ปิดเสียงได้
- **Web Audio API** สร้างเสียงแบบ real-time

## 🎮 วิธีการใช้งานฟีเจอร์ใหม่

### การเล่นกับ AI
1. เลือก "Enable AI Opponent" ก่อนเริ่มเกม
2. เริ่มเกมใหม่ (Random Ships หรือ Custom Placement)
3. ยิงเป้าตามปกติ
4. กดปุ่ม "AI Take Shot 🤖" เพื่อให้ AI ยิงตอบ
5. สลับกันยิงจนกว่าจะมีฝ่ายใดฝ่ายหนึ่งชนะ

### การวางเรือแบบกำหนดเอง
1. กดปุ่ม "Custom Ship Placement"
2. เลือกเรือที่ต้องการวางจาก dropdown
3. เลือกทิศทาง (แนวนอน/แนวตั้ง)
4. คลิกที่กระดานเพื่อวางเรือ
5. วางเรือให้ครบทุกลำ (6 ลำ)
6. กดปุ่ม "เสร็จสิ้น" เพื่อเริ่มเกม

### การดูประวัติเกม
1. เริ่มเกมและยิงอย่างน้อย 1 ครั้ง
2. กดปุ่ม "View History 📊"
3. ดูสถิติและประวัติการยิงทั้งหมด
4. กดปุ่ม "Close" เพื่อกลับสู่เกม

### การควบคุมเสียง
1. เลือก "Sound Effects 🔊" เพื่อเปิด/ปิดเสียง
2. เสียงจะเล่นอัตโนมัติตามเหตุการณ์ในเกม

## 🛠️ การติดตั้งและรัน

### วิธีที่ 1: Docker (แนะนำ)
```bash
# Clone โปรเจกต์
git clone <repository-url>
cd battleship-game

# รันด้วย Docker Compose
docker-compose up --build

# เข้าใช้งานที่ http://localhost:3000
```

### วิธีที่ 2: รันแยกส่วน
```bash
# Backend (Terminal 1)
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (Terminal 2)
cd battleship-frontend
pnpm install
pnpm run dev

# เข้าใช้งานที่ http://localhost:5173
```

## 🔧 API Endpoints ใหม่

### AI Opponent
- `POST /games/{id}/ai-shot` - ให้ AI ยิงเป้า

### Game History
- `GET /games/{id}/history` - ดึงประวัติการยิง
- `GET /games/{id}/statistics` - ดึงสถิติเกม

### Custom Ship Placement
- `GET /ships` - ดึงข้อมูลเรือทั้งหมด
- `POST /ships/validate` - ตรวจสอบการวางเรือ
- `POST /games` (updated) - สร้างเกมพร้อม custom ships

## 📱 Responsive Design
- รองรับทั้ง Desktop และ Mobile
- Touch-friendly interface
- Adaptive layout สำหรับหน้าจอขนาดต่างๆ

## 🎨 UI/UX Improvements
- Modern design ด้วย Tailwind CSS
- Smooth animations และ transitions
- Visual feedback สำหรับการโต้ตอบ
- Intuitive controls และ navigation

## 🧪 การทดสอบ
ฟีเจอร์ทั้งหมดได้รับการทดสอบแล้ว:
- ✅ AI Opponent ทำงานถูกต้อง
- ✅ Custom Ship Placement ใช้งานได้
- ✅ Game History บันทึกข้อมูลครบถ้วน
- ✅ Sound Effects เล่นตามเหตุการณ์
- ✅ API endpoints ตอบสนองถูกต้อง
- ✅ UI responsive ในทุกขนาดหน้าจอ

## 🚀 การพัฒนาต่อ
ฟีเจอร์ที่สามารถเพิ่มในอนาคต:
- Multiplayer online mode
- Tournament system
- Advanced AI difficulty levels
- Ship customization
- Game replay system
- Leaderboard และ achievements

## 📞 การสนับสนุน
หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ console ใน browser สำหรับ error messages
2. ตรวจสอบว่า Backend server รันอยู่ที่ port 8000
3. ตรวจสอบ network connection ระหว่าง Frontend และ Backend

---

**🎮 สนุกกับการเล่นเกมเรือรบรูปแบบใหม่!**

