# Battleship Client-Server – Project Structure

ไฟล์นี้สรุปโครงสร้าง repository ปัจจุบันและหน้าที่หลักของแต่ละโฟลเดอร์/ไฟล์ เพื่อช่วยให้การนำทางโค้ด FastAPI + React ง่ายขึ้น

```text
.
├── README.md
├── documents/                      # เอกสารการวางแผนและผลการทดสอบ
├── BattleShip_CLI/                 # โค้ด CLI เดิม (เก็บไว้เป็นประวัติ)
└── BATTLESHIP_ClientServer/
    ├── app/                        # ซอร์สโค้ด FastAPI และ game engine
    │   ├── main.py                 # ประกาศแอป, middleware, และ REST endpoints ทั้งหมด
    │   ├── core/
    │   │   ├── ai_opponent.py      # AI 4 ระดับ (easy → expert) พร้อมกลยุทธ์ล่าเรือ
    │   │   └── utils.py            # helper สำหรับ parse พิกัดและตรวจสอบข้อมูล
    │   ├── models/
    │   │   ├── board.py            # จัดการกระดาน 10x10, การวางเรือ, ยิง, ตรวจจม
    │   │   └── game_history.py     # เก็บประวัติการยิง, สถิติ, เวลาเริ่ม/จบเกม
    │   └── services/
    │       └── game_service.py     # บริหารสถานะเกมหลายรายการ, เทิร์น, AI, สถิติ
    ├── battleship-frontend/        # เว็บแอป React + Vite
    │   ├── src/
    │   │   ├── App.jsx             # orchestration เรียก API และจัดการ state หลัก
    │   │   ├── components/
    │   │   │   ├── DualGameBoard.jsx   # UI แสดงกระดานผู้เล่น/AI พร้อม debug toggle
    │   │   │   ├── ShipPlacement.jsx   # modal วางเรือ + ตรวจสอบกับ backend
    │   │   │   ├── GameHistory.jsx     # ไทม์ไลน์การยิงจาก backend history
    │   │   │   ├── GameStatusDisplay.jsx, GameStats.jsx, TurnIndicator.jsx, AIStats.jsx
    │   │   │   └── ui/                 # คอมโพเนนต์พื้นฐาน (button, dialog ฯลฯ)
    │   │   └── hooks/useSoundEffects.js # จัดการเสียง hit/miss/win/lose
    │   ├── package.json, vite.config.js, eslint.config.js # การตั้งค่าเครื่องมือฝั่ง frontend
    │   └── public/ และ dist/ (หาก build แล้ว)
    ├── tests/                      # pytest สำหรับ backend (board/game service)
    │   ├── test_board.py
    │   └── test_game_service.py
    ├── requirements.txt            # dependencies backend (FastAPI, uvicorn, pytest ฯลฯ)
    ├── Dockerfile                  # สร้าง image backend FastAPI
    └── docker-compose.yml          # รัน backend + frontend พร้อมกัน (ออปชัน)
```

## แนวทางการใช้งานโครงสร้างนี้
1. เริ่มต้นที่ tree ด้านบนเพื่อระบุว่าโค้ดหรือไฟล์ที่ต้องการอยู่ตำแหน่งใด
2. ถ้าทำงานฝั่ง backend ให้ดูรายละเอียดเพิ่มเติมใน `app/` และไฟล์บริการ (`services/`)
3. ถ้าปรับ UI ให้เริ่มที่ `battleship-frontend/src/App.jsx` และคอมโพเนนต์ใน `src/components/`
4. ชุดทดสอบอยู่ใน `BATTLESHIP_ClientServer/tests/` และสามารถรันด้วย `pytest`
5. เอกสารการวางแผนและผลการทดสอบอื่นๆ อยู่ในโฟลเดอร์ `documents/`
