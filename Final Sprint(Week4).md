# Battleship Board Game — Final Sprint (Week 4)

> **TL;DR**
> Sprint 4 ยกระดับจาก CLI เดี่ยวสู่สถาปัตยกรรม **Client–Server** เต็มรูปแบบ: Backend **FastAPI** + Frontend **React**, มี **AI 4 ระดับ**, **สถิติ/ประวัติการเล่น**, และ **UI สองกระดาน** ที่ตอบสนองแบบเรียลไทม์

---

## 1) ภาพรวมการยกระดับจาก Sprint 3

* Sprint 3: เล่นได้ครบลูปใน CLI แต่จำกัดมุมมองและอินเทอร์แอคชัน
* Sprint 4: แยก **Backend (FastAPI)** และ **Frontend (React)** เชื่อมด้วย **REST API เดียว** ทุกเหตุการณ์ (เริ่มเกม, วางเรือ, ยิง, สถิติ) ไหลผ่านหน้าเว็บเดียว

**อ้างอิงไฟล์:** `app/main.py`, `battleship-frontend/src/App.jsx`, `app/services/game_service.py`, `battleship-frontend/src/components/DualGameBoard.jsx`

### ตารางสรุป: Sprint 3 → Sprint 4

| หมวด             | Sprint 3 (CLI)          | Sprint 4 (Final)                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------------------- |
| สถาปัตยกรรม      | เกมรันใน CLI เดียว      | FastAPI + React (รองรับ CORS, schema-based request/response)               |
| การควบคุมเกม     | คำสั่งพิมพ์ (command)   | REST endpoints: create, shot, AI shot, history, statistics, validate ships |
| การจัดการ State  | อยู่ในโปรเซสเดียว       | `GameService` บริหารหลายเกม, เทิร์น, ชัยชนะ, ประวัติ                       |
| ประสบการณ์ผู้ใช้ | กระดานเดียว, ไม่มีเสียง | **Dual board**, turn indicator, สถิติ, เอฟเฟกต์เสียง, modal วางเรือ        |
| AI               | กลยุทธ์พื้นฐาน          | **4 ระดับ** (Easy→Expert) พร้อม hunt mode / probability / target queue     |
| การทดสอบ         | เล่นมือเป็นหลัก         | เอกสารผลทดสอบ + โครงสร้างข้อมูลรองรับ regression                           |

---

## 2) Backend & API (FastAPI)

* สคีมาและเอ็นด์พอยต์ชัดเจน: `CreateGameRequest`, `ShotRequest`, `ValidateShipsRequest`
* `GameService` จัดหลายเกมพร้อมกัน: สร้าง UUID, ตั้งกระดานผู้เล่น/AI, สลับเทิร์น, ตรวจจบเกม, มุมมองข้อมูลแบบผู้เล่น/ดีบัก
* เอ็นด์พอยต์สถิติ/ประวัติ: ดึง **history**, **statistics**, และ **AI statistics** ได้ทันที

**ไฮไลต์**

* แยก API `/ships` และ `/ships/validate` สำหรับตรวจตำแหน่งเรือก่อนเริ่มเกม
* โครงสร้างข้อมูลรองรับการอ้างอิงย้อนหลัง (QA/Dev) โดยไม่ต้องอ่าน log ดิบ

---

## 3) Game Logic & Data Tracking

* `Board`: ใช้โครงสร้าง `dict` + `set` จัดตำแหน่งเรือ, กันยิงซ้ำ, บอกชื่อเรือที่จม, นับเรือคงเหลือได้มีประสิทธิภาพ
* `GameHistory`: เก็บ `timestamp`, ลำดับการยิง, ผู้ยิง, ผลลัพธ์ (hit/miss), สรุป **hit rate / duration / winner**

**ผลลัพธ์**

* Frontend แสดงสถิติและไทม์ไลน์ภาพรวมของเกมได้ชัดเจน
* รองรับตรวจสอบย้อนหลังและงานทดสอบเชิงระบบ

---

## 4) AI หลายระดับ (Easy → Expert)

* **Easy**: ยิงสุ่ม
* **Medium**: target-following (ตามล่าเป้าหมายเมื่อโดน)
* **Hard**: checkerboard + hunt mode
* **Expert**: probability heatmap + priority/target queue วิเคราะห์ลำดับ hit เพื่อคาดทิศทางเรือ

**เสริม**

* มี **AI stats API** (จำนวนยิง, hit rate, โหมด, คิวเป้าหมาย) สำหรับแสดงผลบน UI แบบเรียลไทม์

---

## 5) Frontend (React) — ประสบการณ์ผู้เล่นครบวงจร

* `App.jsx` เป็น **orchestrator**: จัดการเรียก API, บังคับ custom ship placement, debug mode, เสียง/ข้อความตามผลยิง
* `DualGameBoard`: สองกระดานมองเห็นพร้อมกัน, emoji hit/miss, toggle debug, ล็อกคลิกขณะรอเทิร์น
* `ShipPlacement` (modal): ลาก–วางพร้อมพรีวิว, ตรวจสอบกับ backend ก่อนเริ่มเกมจริง
* ส่วนเสริม UX:

  * `GameStatusDisplay`, `TurnIndicator`, `GameHistory`, `GameStats`
  * `useSoundEffects`: เสียง hit/miss/win/lose/new game/ship sunk

---

## 6) การทดสอบ & คุณภาพ (QA-Friendly)

* เอกสาร `ENHANCED_TESTING_RESULTS.md`: สรุปการทดสอบฟีเจอร์หลัก (debug, single-player firing, custom placement, visibility)
* โครงสร้าง **history/statistics** เปิดทางทดสอบ regression/automation ต่อได้ง่าย

---

## 7) ผลลัพธ์ต่อผู้เล่น & ทีมพัฒนา

* **ผู้เล่น**: ประสบการณ์ใกล้เกมกระดานจริง — เห็นสองกระดานพร้อมกัน, ได้ยินเสียงตอบสนอง, รู้สถานะตลอด (turn, สถิติ) เพื่อปรับแผนได้ทันที
* **ทีม Dev/QA**: เข้าถึงข้อมูลเชิงลึก (history + AI stats) ตรวจเหตุการณ์พิเศษ (ยิงซ้ำ, จมเรือ, ความเร็วคิด AI) ได้สะดวก
* **สถาปัตยกรรมพร้อมต่อยอด**: multiplayer, leaderboard, deployment ด้วย Docker/Compose — โดยไม่ต้องรื้อโค้ด CLI เดิม

---

## 8) บทเรียนสำคัญจาก Sprint 4

1. **Server-side state** ลดปัญหาข้อมูลไม่ตรงกัน และขยายไปสู่ผู้เล่นหลายคนได้ง่าย
2. **Separation of concerns**: Backend ส่งข้อมูลครบ ทำให้แก้/รีแฟกเตอร์ UI ได้โดยไม่แตะ game logic
3. **Presentation matters**: เสียง/สี/modal ทำให้เกม “มีชีวิต” — การนำเสนอที่ดีสำคัญพอ ๆ กับ logic
4. **เอกสารทดสอบช่วย Handoff**: รวมผลทดสอบ + ชี้ไฟล์ที่เกี่ยวข้อง ช่วย onboarding/QA ได้ดีกว่าคำอธิบายปากเปล่า

---

### ภาคผนวก: แหล่งอ้างอิงไฟล์ (ย่อ)

* Backend: `app/main.py`, `app/services/game_service.py`, `app/models/board.py`, `app/models/game_history.py`, `app/core/ai_opponent.py`
* Frontend: `battleship-frontend/src/App.jsx`, `components/DualGameBoard.jsx`, `components/ShipPlacement.jsx`, `components/AIStats.jsx`, `components/GameStatusDisplay.jsx`, `components/TurnIndicator.jsx`, `components/GameHistory.jsx`, `components/GameStats.jsx`, `hooks/useSoundEffects.js`
* เอกสารทดสอบ: `ENHANCED_TESTING_RESULTS.md`

---

> **สรุป**
> Sprint 4 คือการ “รีแบรนด์” จาก CLI สู่เกมออนไลน์พร้อมส่งมอบ: โครงสร้างแยกเลเยอร์, API ชัด, AI แข็งแรง, UI/UX ครบ และฐานข้อมูลสถิติ/ประวัติที่พร้อมต่อยอดผลิตจริงทันที.
