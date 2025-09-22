from typing import Dict, Optional, List, Tuple
from app.models.board import Board
from app.core.ai_opponent import AIOpponent, AIDifficulty
from app.models.game_history import GameHistory
from app.core.utils import GameUtils
import uuid
import time

class GameService:
    games: Dict[str, Dict] = {}
    
    @classmethod
    def create_new_game(cls, with_ai: bool = False, ai_difficulty: str = "medium", custom_ships: Optional[List] = None) -> Dict:
        """สร้างเกมใหม่พร้อมรองรับสองกระดาน"""
        game_id = str(uuid.uuid4())[:8]
        
        # สร้างกระดานผู้เล่น
        player_board = Board()
        if custom_ships:
            # ใช้เรือที่ผู้เล่นวางเอง
            result = player_board.place_ships_custom(custom_ships)
            if not result["success"]:
                return {"error": result["message"]}
        else:
            # วางเรือแบบสุ่ม
            player_board.place_ships_randomly()
        
        # สร้างกระดาน AI (ถ้ามี)
        ai_board = None
        ai_opponent = None
        if with_ai:
            ai_board = Board()
            ai_board.place_ships_randomly()  # AI ใช้การวางเรือแบบสุ่มเสมอ
            
            # สร้าง AI Opponent ตามระดับความยาก
            difficulty_map = {
                "easy": AIDifficulty.EASY,
                "medium": AIDifficulty.MEDIUM,
                "hard": AIDifficulty.HARD,
                "expert": AIDifficulty.EXPERT
            }
            ai_difficulty_enum = difficulty_map.get(ai_difficulty, AIDifficulty.MEDIUM)
            ai_opponent = AIOpponent(ai_difficulty_enum)
        
        # สร้าง Game History
        game_history = GameHistory(game_id)
        
        # เก็บข้อมูลเกม
        cls.games[game_id] = {
            'player_board': player_board,
            'ai_board': ai_board,
            'ai_opponent': ai_opponent,
            'ai_difficulty': ai_difficulty,
            'has_ai': with_ai,
            'current_turn': 'player',  # player หรือ ai
            'game_status': 'active',   # active, player_won, ai_won
            'history': game_history,
            'created_at': time.time()
        }
        
        return {
            'game_id': game_id,
            'player_board_state': player_board.get_board_state(),
            'ai_board_state': ai_board.get_board_state() if ai_board else None,
            'player_ships_positions': player_board.ships_position,
            'ai_ships_positions': ai_board.ships_position if ai_board else None,
            'has_ai': with_ai,
            'ai_difficulty': ai_difficulty if with_ai else None,
            'current_turn': 'player',
            'game_status': 'active'
        }
    
    @classmethod
    def take_shot(cls, game_id: str, row: int, col: int) -> Optional[Dict]:
        """ผู้เล่นยิงใส่กระดาน AI หรือกระดานตัวเองในโหมดเล่นคนเดียว"""
        if game_id not in cls.games:
            return None
        
        game = cls.games[game_id]
        
        # ตรวจสอบว่าเกมยังดำเนินอยู่หรือไม่
        if game['game_status'] != 'active':
            return {
                'status': 'error',
                'message': 'Game is already finished.',
                'game_status': game['game_status']
            }
        
        # สำหรับเกมกับ AI - ตรวจสอบเทิร์น
        if game['has_ai'] and game['current_turn'] != 'player':
            return {
                'status': 'error',
                'message': 'Not your turn! Wait for AI to shoot.',
                'current_turn': game['current_turn']
            }
        
        # เลือกกระดานเป้าหมาย
        if game["has_ai"]:
            # เกมกับ AI - ยิงใส่กระดาน AI
            target_board = game["ai_board"]
            target_type = "ai"
        else:
            # โหมดเล่นคนเดียว - ยิงใส่กระดานตัวเอง
            target_board = game["player_board"]
            target_type = "player"

        if not target_board:
            return {
                "status": "error",
                "message": "No target board available."
            }
        
        # ยิง
        result = target_board.take_shot(row, col)
        
        # บันทึกประวัติ
        position_str = f"{chr(65 + col)}{row + 1}"
        is_hit = result['status'] == 'hit'
        ship_sunk = result.get('ship_sunk', False)
        sunk_ship_name = result.get('sunk_ship_name', None)
        game['history'].add_shot(position_str, result['status'], 'player', is_hit, ship_sunk, sunk_ship_name=sunk_ship_name)
        
        # ตรวจสอบการชนะ
        if result['all_ships_sunk']:
            if game['has_ai']:
                game['game_status'] = 'player_won'
            else:
                game['game_status'] = 'completed'  # สำหรับโหมดเล่นคนเดียว
            game['current_turn'] = None
            game['history'].end_game('player')
        elif game['has_ai']:
            # เปลี่ยนเทิร์นเป็น AI (เฉพาะเกมกับ AI)
            game["current_turn"] = "ai"
        
        return {
            "status": result["status"],
            "message": result["message"],
            "position": position_str,
            "ship_sunk": ship_sunk,
            "sunk_ship_name": sunk_ship_name,
            "all_ships_sunk": result["all_ships_sunk"],
            "ships_remaining": target_board.get_ships_remaining(),
            "board_state": target_board.get_board_state(),
            "current_turn": game["current_turn"],
            "game_status": game["game_status"],
            "target_type": target_type
        }
    
    @classmethod
    def ai_take_shot(cls, game_id: str) -> Optional[Dict]:
        """AI ยิงใส่กระดานผู้เล่น"""
        if game_id not in cls.games:
            return None
        
        game = cls.games[game_id]
        
        # ตรวจสอบว่ามี AI หรือไม่
        if not game['has_ai'] or not game['ai_opponent']:
            return {
                'status': 'error',
                'message': 'No AI opponent in this game.'
            }
        
        # ตรวจสอบว่าเป็นเทิร์นของ AI หรือไม่
        if game['current_turn'] != 'ai':
            return {
                'status': 'error',
                'message': 'Not AI turn! Player needs to shoot first.',
                'current_turn': game['current_turn']
            }
        
        # ตรวจสอบว่าเกมยังดำเนินอยู่หรือไม่
        if game['game_status'] != 'active':
            return {
                'status': 'error',
                'message': 'Game is already finished.',
                'game_status': game['game_status']
            }
        
        # AI เลือกตำแหน่งยิง
        ai_opponent = game['ai_opponent']
        player_board = game['player_board']
        
        row, col = ai_opponent.get_next_shot()
        
        # AI ยิง
        result = player_board.take_shot(row, col)
        
        # แจ้ง AI ผลการยิง
        ai_opponent.notify_shot_result(row, col, result['status'] == 'hit', result.get('ship_sunk', False))
        
        # บันทึกประวัติ
        position_str = f"{chr(65 + col)}{row + 1}"
        is_hit = result['status'] == 'hit'
        ship_sunk = result.get('ship_sunk', False)
        sunk_ship_name = result.get("sunk_ship_name", None)
        game["history"].add_shot(position_str, result["status"], "ai", is_hit, ship_sunk, sunk_ship_name=sunk_ship_name)
        
        
        # ตรวจสอบการชนะ
        if result['all_ships_sunk']:
            game['game_status'] = 'ai_won'
            game['current_turn'] = None
            game['history'].end_game('ai')
        else:
            # เปลี่ยนเทิร์นกลับเป็นผู้เล่น
            game['current_turn'] = 'player'
        
        return {
            'status': result['status'],
            'message': result['message'],
            'position': position_str,
            'ship_sunk': result.get('ship_sunk', False),
            'all_ships_sunk': result['all_ships_sunk'],
            'ships_remaining': player_board.get_ships_remaining(),
            'board_state': player_board.get_board_state(),
            'current_turn': game['current_turn'],
            'game_status': game['game_status']
        }
    
    @classmethod
    def get_game_state(cls, game_id: str, debug_mode: bool = False) -> Optional[Dict]:
        """ดึงสถานะเกมปัจจุบัน"""
        if game_id not in cls.games:
            return None
        
        game = cls.games[game_id]
        player_board = game['player_board']
        ai_board = game['ai_board']
        
        # สำหรับกระดานผู้เล่น - แสดงเรือของตัวเองเสมอ
        player_board_state = player_board.get_board_state()
        player_ships_positions = player_board.ships_position
        
        # สำหรับกระดาน AI - แสดงเรือเฉพาะใน debug mode
        ai_board_state = None
        ai_ships_positions = None
        if ai_board:
            ai_board_state = ai_board.get_board_state()
            if debug_mode:
                ai_ships_positions = ai_board.ships_position
        
        return {
            'game_id': game_id,
            'player_board_state': player_board_state,
            'player_ships_positions': player_ships_positions,
            'ai_board_state': ai_board_state,
            'ai_ships_positions': ai_ships_positions,
            'player_ships_remaining': player_board.get_ships_remaining(),
            'ai_ships_remaining': ai_board.get_ships_remaining() if ai_board else [],
            'has_ai': game['has_ai'],
            'ai_difficulty': game.get('ai_difficulty'),
            'current_turn': game['current_turn'],
            'game_status': game['game_status'],
            'history': game['history'].to_dict(),
            'debug_mode': debug_mode
        }
    
    @classmethod
    def get_game_state_with_debug(cls, game_id: str) -> Optional[Dict]:
        """ดึงสถานะเกมพร้อมตำแหน่งเรือ (สำหรับ debug mode)"""
        if game_id not in cls.games:
            return None
        
        game = cls.games[game_id]
        player_board = game['player_board']
        ai_board = game['ai_board']
        
        return {
            'game_id': game_id,
            'player_board_state': player_board.get_board_state(),
            'player_board_debug': player_board.ships_position,
            'ai_board_state': ai_board.get_board_state() if ai_board else None,
            'ai_board_debug': ai_board.ships_position if ai_board else None,
            'player_ships_remaining': player_board.get_ships_remaining(),
            'ai_ships_remaining': ai_board.get_ships_remaining() if ai_board else [],
            'has_ai': game['has_ai'],
            'ai_difficulty': game.get('ai_difficulty'),
            'current_turn': game['current_turn'],
            'game_status': game['game_status']
        }
    
    @classmethod
    def get_game_history(cls, game_id: str) -> Optional[Dict]:
        """ได้ประวัติการเล่นเกม"""
        if game_id not in cls.games:
            return None
        
        game = cls.games[game_id]
        return game['history'].to_dict()
    
    @classmethod
    def get_game_statistics(cls, game_id: str) -> Optional[Dict]:
        """ได้สถิติของเกม"""
        if game_id not in cls.games:
            return None
        
        game = cls.games[game_id]
        return game['history'].get_statistics()

    @classmethod
    def get_ai_statistics(cls, game_id: str) -> Optional[Dict]:
        """ได้สถิติของ AI opponent"""
        if game_id not in cls.games:
            return None
        
        game = cls.games[game_id]
        if not game['has_ai'] or not game['ai_opponent']:
            return None
        
        ai_stats = game['ai_opponent'].get_ai_stats()
        return ai_stats

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

