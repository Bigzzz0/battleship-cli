# Battleship Board Game CLI – Project Structure

สรุปโครงสร้างไฟล์ของโปรเจกต์ Battleship CLI/FastAPI + React พร้อมคำอธิบายหน้าที่หลักของแต่ละโฟลเดอร์และไฟล์สำคัญ
เพื่อใช้เป็นแผนที่ในการนำทางซอร์สโค้ดและงานเอกสารที่เกี่ยวข้อง

```text
.
├── Dockerfile                      # สร้างอิมเมจ backend FastAPI
├── docker-compose.yml              # orchestration รวม backend + frontend service
├── requirements.txt                # รายการไลบรารี Python สำหรับ backend
├── FINAL_DELIVERY.md               # เอกสารสรุป final delivery
├── ENHANCED_TESTING_RESULTS.md     # บันทึกผลการทดสอบเชิงลึกของ Sprint 4
├── TESTING_RESULTS.md              # ผลการทดสอบหลักจาก Sprint ก่อนหน้า
├── Final Sprint(Week4).md          # บทสรุป Sprint 4 และการเปรียบเทียบกับ Sprint 3
├── app/                            # โค้ด backend FastAPI + game engine
│   ├── main.py                     # entrypoint FastAPI และการประกาศ REST endpoints
│   ├── core/
│   │   ├── ai_opponent.py          # คลาส AI หลายระดับและกลยุทธ์การยิง
│   │   └── utils.py                # ฟังก์ชัน utilities (ตรวจตำแหน่งเรือ ฯลฯ)
│   ├── models/
│   │   ├── board.py                # โครงสร้างข้อมูลกระดานและการจัดการเรือ/การยิง
│   │   └── game_history.py         # โมเดลเก็บประวัติการเล่นและสถิติ
│   └── services/
│       └── game_service.py         # ธุรกิจหลักควบคุมเกม สถิติ และการติดต่อกับ AI
├── battleship-frontend/            # โค้ด React/Vite สำหรับ UI เว็บ
│   ├── Dockerfile                  # สร้างอิมเมจ frontend
│   ├── index.html                  # template หลักที่ Vite ใช้เป็น shell
│   ├── nginx.conf                  # คอนฟิกเสิร์ฟ frontend ภายใต้ nginx container
│   ├── package.json                # สคริปต์และ dependency ฝั่งเว็บ
│   ├── pnpm-lock.yaml              # lockfile เวอร์ชัน dependency
│   ├── src/
│   │   ├── main.jsx                # จุด mount React + provider หลัก
│   │   ├── App.jsx                 # orchestration เรียก API + จัดการ state เกม
│   │   ├── App.css / index.css     # สไตล์หลักของแอป
│   │   ├── assets/                 # ไฟล์ asset (เช่น โลโก้)
│   │   ├── components/
│   │   │   ├── DualGameBoard.jsx   # UI กระดานผู้เล่น/AI แบบคู่
│   │   │   ├── ShipPlacement.jsx   # modal สำหรับวางเรือแบบโต้ตอบ
│   │   │   ├── AIDifficultySelector.jsx, AIStats.jsx, GameHistory.jsx, ฯลฯ
│   │   │   └── ui/                 # คลังคอมโพเนนต์ UI ย่อย (button, dialog, form, ...)
│   │   ├── hooks/                  # custom hooks (เช่น useSoundEffects, use-mobile)
│   │   └── lib/                    # utilities แบ่งใช้ภายใน frontend
│   ├── public/                     # ไฟล์ static ที่เสิร์ฟโดย Vite (favicon ฯลฯ)
│   ├── dist/                       # ไฟล์ build ที่คอมไพล์แล้ว (หากรัน `pnpm build`)
│   ├── eslint.config.js / vite.config.js / jsconfig.json
│   │                               # การตั้งค่าเครื่องมือพัฒนา
│   └── components.json             # catalog ของคอมโพเนนต์ ui
```

> หมายเหตุ: โฟลเดอร์ `battleship-frontend/src/components/ui/` ประกอบด้วยคอมโพเนนต์ย่อยจำนวนมากที่สร้างจาก shadcn/ui
> สำหรับปุ่ม, ฟอร์ม, dialog และ layout ต่างๆ ซึ่งใช้ประกอบ UI หลักที่ระบุไว้ด้านบน

## แนวทางการใช้งานเอกสาร
1. เริ่มที่สรุป tree เพื่อรู้ว่าแต่ละส่วนของระบบอยู่ที่ใด
2. อ่านคำอธิบายเสริมใต้ code block เพื่อเข้าใจบทบาทไฟล์/โฟลเดอร์สำคัญ
3. ใช้คู่กับ `Final Sprint(Week4).md` เพื่อดูบริบทของฟีเจอร์และเอกสารทดสอบที่อ้างอิง.
