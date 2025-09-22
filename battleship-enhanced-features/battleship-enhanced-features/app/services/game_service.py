
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
    def create_new_game(
        cls,
        with_ai: bool = False,
        custom_ships: list = None,
        difficulty: str = "medium",
    ) -> dict:
        game_id = str(uuid.uuid4())

        if with_ai:
            player_board = Board()
            ai_board = Board()

            if custom_ships:
                result = player_board.place_ships_custom(custom_ships)
                if not result["success"]:
                    return {"error": result["message"]}
            else:
                player_board.place_ships_randomly()

            ai_board.place_ships_randomly()

            try:
                ai_opponent = AIOpponent(difficulty)
            except ValueError as exc:
                return {"error": str(exc)}

            cls._games[game_id] = {
                "player_board": player_board,
                "ai_board": ai_board,
                "current_turn": "player",
                "winner": None,
                "difficulty": difficulty,
            }
            cls._ai_opponents[game_id] = ai_opponent

            cls._game_histories[game_id] = GameHistory(game_id)

            return {
                "game_id": game_id,
                "player_board_state": player_board.get_board_state(),
                "ai_board_state": ai_board.get_board_state(),
                "player_ships_remaining": player_board.get_ships_remaining(),
                "ai_ships_remaining": ai_board.get_ships_remaining(),
                "current_turn": "player",
                "has_ai": True,
                "ai_difficulty": difficulty,
            }

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

        # สร้าง Game History
        cls._game_histories[game_id] = GameHistory(game_id)

        return {"game_id": game_id, "board_state": board.get_board_state(), "has_ai": False}

    @classmethod
    def get_game_state_with_debug(cls, game_id: str) -> dict | None:
        game_data = cls._games.get(game_id)
        if not game_data:
            return None

        if cls._is_ai_game_data(game_data):
            player_board = game_data["player_board"]
            ai_board = game_data["ai_board"]
            return {
                "game_id": game_id,
                "player_board_state": player_board.get_board_state(),
                "ai_board_state": ai_board.get_board_state(),
                "player_ships_remaining": player_board.get_ships_remaining(),
                "ai_ships_remaining": ai_board.get_ships_remaining(),
                "player_ships_position": player_board.ships_position,
                "ai_ships_position": ai_board.ships_position,
                "all_ships_sunk": {
                    "player": player_board.all_ships_sunk(),
                    "ai": ai_board.all_ships_sunk(),
                },
                "has_ai": True,
                "current_turn": game_data.get("current_turn"),
                "winner": game_data.get("winner"),
                "ai_difficulty": game_data.get("difficulty"),
            }

        board = game_data
        return {
            "game_id": game_id,
            "board_state": board.get_board_state(),
            "ships_remaining": board.get_ships_remaining(),
            "all_ships_sunk": board.all_ships_sunk(),
            "ships_position": board.ships_position
        }

    @classmethod
    def get_game_state(cls, game_id: str) -> dict | None:
        game_data = cls._games.get(game_id)
        if not game_data:
            return None

        if cls._is_ai_game_data(game_data):
            player_board = game_data["player_board"]
            ai_board = game_data["ai_board"]
            return {
                "game_id": game_id,
                "player_board_state": player_board.get_board_state(),
                "ai_board_state": ai_board.get_board_state(),
                "player_ships_remaining": player_board.get_ships_remaining(),
                "ai_ships_remaining": ai_board.get_ships_remaining(),
                "all_ships_sunk": {
                    "player": player_board.all_ships_sunk(),
                    "ai": ai_board.all_ships_sunk(),
                },
                "current_turn": game_data.get("current_turn"),
                "winner": game_data.get("winner"),
                "has_ai": True,
                "ai_difficulty": game_data.get("difficulty"),
            }

        board = game_data
        return {
            "game_id": game_id,
            "board_state": board.get_board_state(),
            "ships_remaining": board.get_ships_remaining(),
            "all_ships_sunk": board.all_ships_sunk(),
            "has_ai": False
        }

    @classmethod
    def take_shot(cls, game_id: str, position: str) -> dict | None:
        game_data = cls._games.get(game_id)
        if not game_data:
            return None

        try:
            row, col = cls._parse_position(position)
        except ValueError as exc:
            return {"status": "error", "message": str(exc)}

        if cls._is_ai_game_data(game_data):
            if game_data.get("winner"):
                return {
                    "status": "error",
                    "message": "Game has already finished.",
                    "current_turn": "finished",
                    "winner": game_data.get("winner"),
                    "game_id": game_id,
                    "has_ai": True,
                    "ai_difficulty": game_data.get("difficulty"),
                }

            if game_data.get("current_turn") != "player":
                return {
                    "status": "error",
                    "message": "It's not the player's turn yet.",
                    "current_turn": game_data.get("current_turn"),
                    "game_id": game_id,
                    "has_ai": True,
                    "ai_difficulty": game_data.get("difficulty"),
                }

            player_board = game_data["player_board"]
            ai_board = game_data["ai_board"]

            shot_raw = ai_board.take_shot(row, col)
            position_str = cls._format_position(row, col)
            is_hit = shot_raw["status"] == "hit"
            ship_sunk = shot_raw.get("ship_sunk", False)

            if game_id in cls._game_histories:
                history = cls._game_histories[game_id]
                history.add_shot(position_str, shot_raw["status"], "player", is_hit, ship_sunk)
                if ai_board.all_ships_sunk():
                    history.end_game("player")

            player_shot = {
                "status": shot_raw["status"],
                "message": shot_raw["message"],
                "position": position_str,
                "target": "ai",
                "ship_sunk": ship_sunk,
                "ships_remaining": ai_board.get_ships_remaining(),
                "all_ships_sunk": ai_board.all_ships_sunk(),
            }

            if ai_board.all_ships_sunk():
                game_data["current_turn"] = "finished"
                game_data["winner"] = "player"
            else:
                game_data["current_turn"] = "ai"

            response = {
                "game_id": game_id,
                "has_ai": True,
                "ai_difficulty": game_data.get("difficulty"),
                "player_shot": player_shot,
                "player_board_state": player_board.get_board_state(),
                "ai_board_state": ai_board.get_board_state(),
                "player_ships_remaining": player_board.get_ships_remaining(),
                "ai_ships_remaining": ai_board.get_ships_remaining(),
                "current_turn": game_data.get("current_turn"),
            }

            if game_data.get("winner"):
                response["winner"] = game_data.get("winner")

            return response

        board = game_data

        shot_result = board.take_shot(row, col)
        shot_result["game_id"] = game_id
        shot_result["board_state"] = board.get_board_state()
        shot_result["ships_remaining"] = board.get_ships_remaining()
        shot_result["all_ships_sunk"] = board.all_ships_sunk()

        if game_id in cls._game_histories:
            history = cls._game_histories[game_id]
            is_hit = shot_result["status"] == "hit"
            ship_sunk = shot_result.get("ship_sunk", False)
            history.add_shot(position, shot_result["status"], "player", is_hit, ship_sunk)

            if shot_result["all_ships_sunk"]:
                history.end_game("player")

        return shot_result

    @classmethod
    def ai_take_shot(cls, game_id: str) -> dict | None:
        """ให้ AI ยิง"""
        game_data = cls._games.get(game_id)
        ai = cls._ai_opponents.get(game_id)

        if not game_data or not ai or not cls._is_ai_game_data(game_data):
            return None

        if game_data.get("winner"):
            return {
                "status": "error",
                "message": "Game has already finished.",
                "current_turn": "finished",
                "winner": game_data.get("winner"),
                "game_id": game_id,
                "has_ai": True,
                "ai_difficulty": game_data.get("difficulty"),
            }

        if game_data.get("current_turn") != "ai":
            return {
                "status": "error",
                "message": "It's not the AI's turn yet.",
                "current_turn": game_data.get("current_turn"),
                "game_id": game_id,
                "has_ai": True,
                "ai_difficulty": game_data.get("difficulty"),
            }

        shot_result = cls._execute_ai_turn(game_id)
        if shot_result is None:
            return None

        player_board = game_data["player_board"]
        ai_board = game_data["ai_board"]

        if shot_result.get("all_ships_sunk"):
            game_data["current_turn"] = "finished"
            game_data["winner"] = "ai"
        else:
            game_data["current_turn"] = "player"

        response = {
            "game_id": game_id,
            "has_ai": True,
            "ai_difficulty": game_data.get("difficulty"),
            "ai_shot": shot_result,
            "player_board_state": player_board.get_board_state(),
            "ai_board_state": ai_board.get_board_state(),
            "player_ships_remaining": player_board.get_ships_remaining(),
            "ai_ships_remaining": ai_board.get_ships_remaining(),
            "current_turn": game_data.get("current_turn"),
        }

        if game_data.get("winner"):
            response["winner"] = game_data.get("winner")

        return response

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

    @classmethod
    def _execute_ai_turn(cls, game_id: str) -> dict | None:
        game_data = cls._games.get(game_id)
        ai = cls._ai_opponents.get(game_id)

        if not game_data or not ai or not cls._is_ai_game_data(game_data):
            return None

        player_board = game_data["player_board"]
        row, col = ai.get_next_shot()
        shot_raw = player_board.take_shot(row, col)
        position_str = cls._format_position(row, col)
        is_hit = shot_raw["status"] == "hit"
        ship_sunk = shot_raw.get("ship_sunk", False)

        ai.update_shot_result((row, col), is_hit, ship_sunk)

        if game_id in cls._game_histories:
            history = cls._game_histories[game_id]
            history.add_shot(position_str, shot_raw["status"], "ai", is_hit, ship_sunk)
            if player_board.all_ships_sunk():
                history.end_game("ai")

        return {
            "game_id": game_id,
            "status": shot_raw["status"],
            "message": shot_raw["message"],
            "position": position_str,
            "target": "player",
            "ai_shot": True,
            "ship_sunk": ship_sunk,
            "ships_remaining": player_board.get_ships_remaining(),
            "all_ships_sunk": player_board.all_ships_sunk(),
        }

    @staticmethod
    def _is_ai_game_data(game_data) -> bool:
        return (
            isinstance(game_data, dict)
            and "player_board" in game_data
            and "ai_board" in game_data
        )

    @staticmethod
    def _parse_position(position: str) -> tuple[int, int]:
        if len(position) < 2 or len(position) > 3:
            raise ValueError("Invalid position format. Expected A1-J10.")

        if position[0].isalpha() and position[1:].isdigit():
            col_char = position[0]
            row_num_str = position[1:]
        elif position[0].isdigit() and position[1].isalpha():
            row_num_str = position[0]
            col_char = position[1]
        else:
            raise ValueError("Invalid position format. Expected A1-J10.")

        if not GameUtils.is_valid_position(col_char, row_num_str):
            raise ValueError("Invalid position. Please enter a letter A-J and a number 1-10.")

        row, col = GameUtils.parse_position(col_char, row_num_str)
        return row, col

    @staticmethod
    def _format_position(row: int, col: int) -> str:
        return f"{chr(ord('A') + col)}{row + 1}"


