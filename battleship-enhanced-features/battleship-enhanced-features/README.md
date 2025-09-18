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
Response:
```json
{
  "game_id": "uuid",
  "board_state": [[...]]
}
```

### 2. ดูสถานะเกม
```
GET /games/{game_id}
```
Response:
```json
{
  "game_id": "uuid",
  "board_state": [[...]],
  "ships_remaining": [...],
  "all_ships_sunk": false
}
```

### 3. ยิงเป้า
```
POST /games/{game_id}/fire
Content-Type: application/json

{
  "position": "A1"
}
```
Response:
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
2. **AI Integration**: เพิ่ม AI opponent
3. **Database**: เพิ่ม database สำหรับเก็บ game state
4. **Authentication**: เพิ่มระบบ user authentication
5. **Multiplayer**: เพิ่มฟีเจอร์ multiplayer

## การมีส่วนร่วม

1. Fork repository
2. สร้าง feature branch
3. Commit changes
4. Push และสร้าง Pull Request

