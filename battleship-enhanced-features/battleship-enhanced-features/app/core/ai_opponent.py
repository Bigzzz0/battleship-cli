import random
from typing import Tuple, List, Set

class AIOpponent:
    """AI Opponent สำหรับเกมเรือรบ"""
    
    def __init__(self):
        self.shot_history: Set[Tuple[int, int]] = set()
        self.hit_positions: List[Tuple[int, int]] = []
        self.target_queue: List[Tuple[int, int]] = []
        self.hunting_mode = False
        
    def get_next_shot(self, board_size: int = 10) -> Tuple[int, int]:
        """
        ได้ตำแหน่งการยิงครั้งถัดไป
        
        Strategy:
        1. หากอยู่ใน hunting mode (เพิ่งโดนเรือ) จะยิงรอบๆ ตำแหน่งที่โดน
        2. หากไม่อยู่ใน hunting mode จะยิงแบบสุ่ม
        """
        
        # หากมี target ใน queue (hunting mode)
        if self.target_queue:
            return self._get_hunting_shot(board_size)
        
        # หากไม่มี target ให้ยิงแบบสุ่ม
        return self._get_random_shot(board_size)
    
    def _get_hunting_shot(self, board_size: int) -> Tuple[int, int]:
        """ยิงรอบๆ ตำแหน่งที่โดนเรือ"""
        while self.target_queue:
            target = self.target_queue.pop(0)
            if target not in self.shot_history:
                return target
        
        # หากไม่มี target ที่ยังไม่ได้ยิง ให้ยิงแบบสุ่ม
        return self._get_random_shot(board_size)
    
    def _get_random_shot(self, board_size: int) -> Tuple[int, int]:
        """ยิงแบบสุ่ม"""
        available_positions = []
        for row in range(board_size):
            for col in range(board_size):
                if (row, col) not in self.shot_history:
                    available_positions.append((row, col))
        
        if not available_positions:
            # หากยิงครบทุกตำแหน่งแล้ว (ไม่น่าจะเกิดขึ้น)
            return (0, 0)
        
        return random.choice(available_positions)
    
    def update_shot_result(self, position: Tuple[int, int], is_hit: bool, is_sunk: bool = False):
        """
        อัปเดตผลการยิง
        
        Args:
            position: ตำแหน่งที่ยิง
            is_hit: ผลการยิง (โดนหรือไม่)
            is_sunk: เรือจมหรือไม่
        """
        self.shot_history.add(position)
        
        if is_hit:
            self.hit_positions.append(position)
            self.hunting_mode = True
            
            if is_sunk:
                # หากเรือจม ให้ออกจาก hunting mode
                self.hunting_mode = False
                self.target_queue.clear()
            else:
                # หากเรือยังไม่จม ให้เพิ่มตำแหน่งรอบๆ ใน target queue
                self._add_adjacent_targets(position)
        
        elif self.hunting_mode and not self.target_queue:
            # หากพลาดและไม่มี target เหลือ ให้ออกจาก hunting mode
            self.hunting_mode = False
    
    def _add_adjacent_targets(self, position: Tuple[int, int], board_size: int = 10):
        """เพิ่มตำแหน่งรอบๆ ใน target queue"""
        row, col = position
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]  # ขวา, ซ้าย, ลง, ขึ้น
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            if (0 <= new_row < board_size and 
                0 <= new_col < board_size and 
                (new_row, new_col) not in self.shot_history and
                (new_row, new_col) not in self.target_queue):
                self.target_queue.append((new_row, new_col))
    
    def reset(self):
        """รีเซ็ต AI สำหรับเกมใหม่"""
        self.shot_history.clear()
        self.hit_positions.clear()
        self.target_queue.clear()
        self.hunting_mode = False

