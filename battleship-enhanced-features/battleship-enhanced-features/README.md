# Battleship Game API

เกมเรือรบแบบ Web API ที่พัฒนาด้วย FastAPI

## โครงสร้างโปรเจกต์

```
.
├── app/
│   ├── core/
│   │   └── utils.py          # Utility functions
│   ├── models/
│   │   └── board.py          # Board model และ game logic
│   ├── services/
│   │   └── game_service.py   # Game service layer
│   └── main.py               # FastAPI application
├── .github/
│   └── workflows/
│       └── main.yml          # CI/CD pipeline
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

## API Endpoints

### 1. สร้างเกมใหม่
```
POST /games
```

**Request Body (optional)**

```json
{
  "with_ai": true,
  "difficulty": "hard",
  "custom_ships": [...]
}
```

- `with_ai`: `true` เพื่อเริ่มเกมสู้กับ AI (ค่าเริ่มต้น `false`).
- `difficulty`: ระดับความยากของ AI (`"easy"`, `"medium"`, `"hard"`) ค่าเริ่มต้นคือ `"medium"`.
- `custom_ships`: ระบุตำแหน่งเรือของผู้เล่นเอง (ใช้รูปแบบเดียวกับบริการ `validate`).

**Response (เล่นคนเดียว)**

```json
{
  "game_id": "uuid",
  "board_state": [[...]],
  "has_ai": false
}
```

**Response (เล่นกับ AI)**

```json
{
  "game_id": "uuid",
  "player_board_state": [[...]],
  "ai_board_state": [[...]],
  "player_ships_remaining": [...],
  "ai_ships_remaining": [...],
  "current_turn": "player",
  "has_ai": true,
  "ai_difficulty": "hard"
}
```

### 2. ดูสถานะเกม
```
GET /games/{game_id}
```

**Response (เล่นคนเดียว)**

```json
{
  "game_id": "uuid",
  "board_state": [[...]],
  "ships_remaining": [...],
  "all_ships_sunk": false,
  "has_ai": false
}
```

**Response (เล่นกับ AI)**

```json
{
  "game_id": "uuid",
  "player_board_state": [[...]],
  "ai_board_state": [[...]],
  "player_ships_remaining": [...],
  "ai_ships_remaining": [...],
  "all_ships_sunk": {"player": false, "ai": false},
  "current_turn": "player",
  "winner": null,
  "has_ai": true,
  "ai_difficulty": "medium"
}
```

### 3. ยิงเป้า (เทิร์นของผู้เล่น)
```
POST /games/{game_id}/fire
Content-Type: application/json

{
  "position": "A1"
}
```

**Response (เล่นคนเดียว)**

```json
{
  "status": "hit|miss|already_shot|error",
  "message": "...",
  "game_id": "uuid",
  "board_state": [[...]],
  "ships_remaining": [...],
  "all_ships_sunk": false
}
```

**Response (เล่นกับ AI)**

```json
{
  "game_id": "uuid",
  "has_ai": true,
  "ai_difficulty": "medium",
  "player_shot": {
    "status": "hit|miss|already_shot|error",
    "message": "...",
    "position": "A1",
    "target": "ai",
    "ships_remaining": [...],
    "all_ships_sunk": false
  },
  "player_board_state": [[...]],
  "ai_board_state": [[...]],
  "player_ships_remaining": [...],
  "ai_ships_remaining": [...],
  "current_turn": "ai"
}
```

### 4. ให้ AI ยิง (เทิร์นของ AI)
```
POST /games/{game_id}/ai-shot
```

เรียกใช้หลังจากที่ `current_turn` เป็น `"ai"` ผลลัพธ์จะมีรายละเอียดการยิงของ AI:

```json
{
  "game_id": "uuid",
  "has_ai": true,
  "ai_difficulty": "medium",
  "ai_shot": {
    "status": "hit|miss|already_shot|error",
    "message": "...",
    "position": "B5",
    "target": "player",
    "ships_remaining": [...],
    "all_ships_sunk": false
  },
  "player_board_state": [[...]],
  "ai_board_state": [[...]],
  "player_ships_remaining": [...],
  "ai_ships_remaining": [...],
  "current_turn": "player"
}
```

## การรันโปรเจกต์

### วิธีที่ 1: รันด้วย Python โดยตรง

1. ติดตั้ง dependencies:
```bash
pip install -r requirements.txt
```

2. รัน server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

3. เข้าถึง API ที่: http://localhost:8000

### วิธีที่ 2: รันด้วย Docker

1. Build และรัน:
```bash
docker-compose up --build
```

2. เข้าถึง API ที่: http://localhost:8000

## การพัฒนา

### การทดสอบ
```bash
# ติดตั้ง testing dependencies
pip install pytest flake8

# รัน linting
flake8 .

# รัน tests (ถ้ามี)
pytest
```

### CI/CD
โปรเจกต์มี GitHub Actions workflow ที่จะ:
- ทำ linting ด้วย flake8
- รัน tests
- Build Docker image
- ทดสอบ Docker image

## ขั้นตอนถัดไป

1. **Frontend Development**: สร้าง React frontend ด้วย Tailwind CSS
2. **AI Improvements**: ปรับปรุงกลยุทธ์ AI เพิ่มเติม
3. **Database**: เพิ่ม database สำหรับเก็บ game state
4. **Authentication**: เพิ่มระบบ user authentication
5. **Multiplayer**: เพิ่มฟีเจอร์ multiplayer

## การมีส่วนร่วม

1. Fork repository
2. สร้าง feature branch
3. Commit changes
4. Push และสร้าง Pull Request

