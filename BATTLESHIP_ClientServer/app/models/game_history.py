from typing import List, Dict, Any, Optional
from datetime import datetime

class GameHistory:
    """เก็บประวัติการเล่นเกม"""
    
    def __init__(self, game_id: str):
        self.game_id = game_id
        self.shots: List[Dict[str, Any]] = []
        self.start_time = datetime.now()
        self.end_time = None
        self.winner = None  # "player", "ai", หรือ None
        
    def add_shot(self, position: str, result: str, player: str = "player", 
                 is_hit: bool = False, ship_sunk: bool = False, sunk_ship_name: Optional[str] = None):
        """
        เพิ่มการยิงในประวัติ
        
        Args:
            position: ตำแหน่งที่ยิง (เช่น "A1")
            result: ผลการยิง ("hit", "miss", "already_shot")
            player: ผู้ยิง ("player" หรือ "ai")
            is_hit: โดนเป้าหรือไม่
            ship_sunk: เรือจมหรือไม่
        """
        shot_data = {
            "shot_number": len(self.shots) + 1,
            "timestamp": datetime.now().isoformat(),
            "position": position,
            "result": result,
            "player": player,
            "is_hit": is_hit,
            "ship_sunk": ship_sunk,
            "sunk_ship_name": sunk_ship_name
        }
        self.shots.append(shot_data)
    
    def end_game(self, winner: str = None):
        """จบเกม"""
        self.end_time = datetime.now()
        self.winner = winner
    
    def get_statistics(self) -> Dict[str, Any]:
        """ได้สถิติของเกม"""
        player_shots = [shot for shot in self.shots if shot["player"] == "player"]
        ai_shots = [shot for shot in self.shots if shot["player"] == "ai"]
        
        player_hits = len([shot for shot in player_shots if shot["is_hit"]])
        ai_hits = len([shot for shot in ai_shots if shot["is_hit"]])
        
        duration = None
        if self.end_time:
            duration = (self.end_time - self.start_time).total_seconds()
        
        return {
            "game_id": self.game_id,
            "total_shots": len(self.shots),
            "player_shots": len(player_shots),
            "ai_shots": len(ai_shots),
            "player_hits": player_hits,
            "ai_hits": ai_hits,
            "player_hit_rate": (player_hits / len(player_shots) * 100) if player_shots else 0,
            "ai_hit_rate": (ai_hits / len(ai_shots) * 100) if ai_shots else 0,
            "duration_seconds": duration,
            "winner": self.winner,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None
        }
    
    def get_shot_history(self) -> List[Dict[str, Any]]:
        """ได้ประวัติการยิงทั้งหมด"""
        return self.shots.copy()
    
    def to_dict(self) -> Dict[str, Any]:
        """แปลงเป็น dictionary"""
        return {
            "game_id": self.game_id,
            "shots": self.shots,
            "statistics": self.get_statistics()
        }

