
from app.models.board import Board
from app.core.utils import GameUtils
from app.core.ai_opponent import AIOpponent
from app.models.game_history import GameHistory
import uuid

class GameService:
    _games = {}
    _ai_opponents = {}  # เก็บ AI สำหรับแต่ละเกม
    _game_histories = {}  # เก็บประวัติเกม

    @classmethod
    def create_new_game(cls, with_ai: bool = False, custom_ships: list = None) -> dict:
        game_id = str(uuid.uuid4())
        board = Board()
        
        if custom_ships:
            # วางเรือตามที่กำหนด
            result = board.place_ships_custom(custom_ships)
            if not result["success"]:
                return {"error": result["message"]}
        else:
            # วางเรือแบบสุ่ม
            board.place_ships_randomly()
        
        cls._games[game_id] = board
        
        # สร้าง AI หากต้องการ
        if with_ai:
            cls._ai_opponents[game_id] = AIOpponent()
        
        # สร้าง Game History
        cls._game_histories[game_id] = GameHistory(game_id)
        
        return {"game_id": game_id, "board_state": board.get_board_state(), "has_ai": with_ai}

    @classmethod
    def get_game_state_with_debug(cls, game_id: str) -> dict | None:
        board = cls._games.get(game_id)
        if board:
            return {
                "game_id": game_id,
                "board_state": board.get_board_state(),
                "ships_remaining": board.get_ships_remaining(),
                "all_ships_sunk": board.all_ships_sunk(),
                "ships_position": board.ships_position
            }
        return None

    @classmethod
    def get_game_state(cls, game_id: str) -> dict | None:
        board = cls._games.get(game_id)
        if board:
            has_ai = game_id in cls._ai_opponents
            return {
                "game_id": game_id,
                "board_state": board.get_board_state(),
                "ships_remaining": board.get_ships_remaining(),
                "all_ships_sunk": board.all_ships_sunk(),
                "has_ai": has_ai
            }
        return None

    @classmethod
    def take_shot(cls, game_id: str, position: str) -> dict | None:
        board = cls._games.get(game_id)
        if not board:
            return None

        # Assuming position is like 'A1', 'J10'
        if len(position) < 2 or len(position) > 3:
            return {"status": "error", "message": "Invalid position format. Expected A1-J10."}

        # Parse position into row and column
        # This part needs to handle 'A10' or 'J1' correctly
        if position[0].isalpha() and position[1:].isdigit():
            col_char = position[0]
            row_num_str = position[1:]
        elif position[0].isdigit() and position[1].isalpha(): # This case is less common for battleship but good to handle
            row_num_str = position[0]
            col_char = position[1]
        else:
            return {"status": "error", "message": "Invalid position format. Expected A1-J10."}

        if not GameUtils.is_valid_position(col_char, row_num_str):
             return {"status": "error", "message": "Invalid position. Please enter a letter A-J and a number 1-10."}

        row, col = GameUtils.parse_position(col_char, row_num_str)

        shot_result = board.take_shot(row, col)
        shot_result["game_id"] = game_id
        shot_result["board_state"] = board.get_board_state()
        shot_result["ships_remaining"] = board.get_ships_remaining()
        shot_result["all_ships_sunk"] = board.all_ships_sunk()
        
        # บันทึกประวัติ
        if game_id in cls._game_histories:
            history = cls._game_histories[game_id]
            is_hit = shot_result["status"] == "hit"
            ship_sunk = shot_result.get("ship_sunk", False)
            history.add_shot(position, shot_result["status"], "player", is_hit, ship_sunk)
            
            # ตรวจสอบว่าเกมจบหรือไม่
            if shot_result["all_ships_sunk"]:
                history.end_game("player")
        
        # อัปเดต AI หากมี
        if game_id in cls._ai_opponents:
            ai = cls._ai_opponents[game_id]
            is_hit = shot_result["status"] == "hit"
            is_sunk = shot_result.get("ship_sunk", False)
            ai.update_shot_result((row, col), is_hit, is_sunk)
        
        return shot_result

    @classmethod
    def ai_take_shot(cls, game_id: str) -> dict | None:
        """ให้ AI ยิง"""
        board = cls._games.get(game_id)
        ai = cls._ai_opponents.get(game_id)
        
        if not board or not ai:
            return None
        
        # ให้ AI เลือกตำแหน่งยิง
        row, col = ai.get_next_shot()
        
        # ยิง
        shot_result = board.take_shot(row, col)
        shot_result["game_id"] = game_id
        shot_result["board_state"] = board.get_board_state()
        shot_result["ships_remaining"] = board.get_ships_remaining()
        shot_result["all_ships_sunk"] = board.all_ships_sunk()
        shot_result["ai_shot"] = True
        shot_result["position"] = f"{chr(65 + col)}{row + 1}"  # แปลงกลับเป็น A1 format
        
        # อัปเดต AI
        is_hit = shot_result["status"] == "hit"
        is_sunk = shot_result.get("ship_sunk", False)
        ai.update_shot_result((row, col), is_hit, is_sunk)
        
        # บันทึกประวัติ
        if game_id in cls._game_histories:
            history = cls._game_histories[game_id]
            position_str = shot_result["position"]
            ship_sunk = shot_result.get("ship_sunk", False)
            history.add_shot(position_str, shot_result["status"], "ai", is_hit, ship_sunk)
            
            # ตรวจสอบว่าเกมจบหรือไม่ (AI ชนะ)
            if shot_result["all_ships_sunk"]:
                history.end_game("ai")
        
        return shot_result

    @classmethod
    def get_game_history(cls, game_id: str) -> dict | None:
        """ได้ประวัติการเล่นเกม"""
        history = cls._game_histories.get(game_id)
        if history:
            return history.to_dict()
        return None
    
    @classmethod
    def get_game_statistics(cls, game_id: str) -> dict | None:
        """ได้สถิติของเกม"""
        history = cls._game_histories.get(game_id)
        if history:
            return history.get_statistics()
        return None

    @classmethod
    def validate_ship_placement(cls, ship_placements: list) -> dict:
        """ตรวจสอบการวางเรือโดยไม่สร้างเกม"""
        temp_board = Board()
        result = temp_board.place_ships_custom(ship_placements)
        return result
    
    @classmethod
    def get_ship_info(cls) -> dict:
        """ได้ข้อมูลเรือทั้งหมด"""
        temp_board = Board()
        return temp_board.ships


