from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.services.game_service import GameService
from app.core.utils import GameUtils

app = FastAPI(title="Battleship Game API", version="1.0.0")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ShotRequest(BaseModel):
    position: str

class CreateGameRequest(BaseModel):
    with_ai: bool = False
    ai_difficulty: str = "medium"  # easy, medium, hard
    custom_ships: Optional[list] = None

class ShipPlacement(BaseModel):
    ship_name: str
    start_row: int
    start_col: int
    direction: str  # "horizontal" หรือ "vertical"

class ValidateShipsRequest(BaseModel):
    ship_placements: list[ShipPlacement]

@app.get("/")
async def root():
    return {"message": "Battleship Game API"}

@app.post("/games")
async def create_game(request: CreateGameRequest = CreateGameRequest()):
    """Create a new battleship game with optional AI opponent and difficulty"""
    try:
        # Validate AI difficulty
        valid_difficulties = ["easy", "medium", "hard", "expert"]
        if request.with_ai and request.ai_difficulty not in valid_difficulties:
            raise HTTPException(status_code=400, detail=f"Invalid AI difficulty. Must be one of: {valid_difficulties}")
        
        custom_ships = None
        if request.custom_ships:
            # แปลง custom_ships เป็น format ที่ backend ต้องการ
            custom_ships = [ship.dict() if hasattr(ship, 'dict') else ship for ship in request.custom_ships]
        
        game_data = GameService.create_new_game(
            with_ai=request.with_ai,
            ai_difficulty=request.ai_difficulty,
            custom_ships=custom_ships
        )
        
        if "error" in game_data:
            raise HTTPException(status_code=400, detail=game_data["error"])
        
        return game_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/games/{game_id}")
async def get_game_state(game_id: str, debug_mode: bool = False):
    """Get the current state of a game"""
    game_state = GameService.get_game_state(game_id, debug_mode=debug_mode)
    if game_state is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game_state

@app.get("/games/{game_id}/debug")
async def get_game_state_debug(game_id: str):
    """Get the current state of a game with ship positions (for debug mode)"""
    game_state = GameService.get_game_state_with_debug(game_id)
    if game_state is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game_state

@app.post("/games/{game_id}/fire")
async def fire_shot(game_id: str, shot_request: ShotRequest):
    """Fire a shot at the target board (AI's board if playing with AI)"""
    try:
        # Parse position (e.g., "A1" -> row=0, col=0)
        position = shot_request.position
        row, col = GameUtils.parse_position(position)

        
        result = GameService.take_shot(game_id, row, col)
        if result is None:
            raise HTTPException(status_code=404, detail="Game not found")
        
        if result.get('status') == 'error':
            raise HTTPException(status_code=400, detail=result.get('message', 'Unknown error'))
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/games/{game_id}/ai-shot")
async def ai_fire_shot(game_id: str):
    """Let AI fire a shot at player's board"""
    try:
        shot_result = GameService.ai_take_shot(game_id)
        if shot_result is None:
            raise HTTPException(status_code=404, detail="Game not found")
        
        if shot_result.get('status') == 'error':
            raise HTTPException(status_code=400, detail=shot_result.get('message', 'Unknown error'))
        
        return shot_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/games/{game_id}/history")
async def get_game_history(game_id: str):
    """Get game history"""
    history = GameService.get_game_history(game_id)
    if history is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return history

@app.get("/games/{game_id}/statistics")
async def get_game_statistics(game_id: str):
    """Get game statistics"""
    stats = GameService.get_game_statistics(game_id)
    if stats is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return stats

@app.get("/games/{game_id}/ai-stats")
async def get_ai_statistics(game_id: str):
    """Get AI performance statistics"""
    stats = GameService.get_ai_statistics(game_id)
    if stats is None:
        raise HTTPException(status_code=404, detail="Game not found or no AI opponent")
    return stats

@app.get("/ships")
async def get_ship_info():
    """Get information about all ships"""
    return GameService.get_ship_info()

@app.post("/ships/validate")
async def validate_ship_placement(request: ValidateShipsRequest):
    """Validate ship placement without creating a game"""
    ship_placements = [ship.dict() for ship in request.ship_placements]
    result = GameService.validate_ship_placement(ship_placements)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

