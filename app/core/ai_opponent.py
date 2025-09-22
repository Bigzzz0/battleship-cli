import random
from typing import List, Tuple, Optional, Set
from enum import Enum

class AIDifficulty(Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"  # เพิ่มระดับ Expert

class AIOpponent:
    def __init__(self, difficulty: AIDifficulty = AIDifficulty.MEDIUM):
        self.difficulty = difficulty
        self.last_hit = None
        self.target_queue = []  # For tracking hits in medium/hard mode
        self.shot_history = set()  # Track all shots taken
        self.hunt_mode = False  # For hard mode
        self.hunt_targets = []  # Potential targets in hunt mode
        self.hit_sequence = []  # Track sequence of hits for ship direction detection
        self.probable_ship_positions = set()  # For expert mode
        self.ship_sizes = [5, 4, 3, 3, 2, 2]  # Standard battleship ship sizes
        
    def get_next_shot(self, board_size: int = 10) -> Tuple[int, int]:
        """Get the next shot position based on AI difficulty"""
        if self.difficulty == AIDifficulty.EASY:
            return self._get_random_shot(board_size)
        elif self.difficulty == AIDifficulty.MEDIUM:
            return self._get_medium_shot(board_size)
        elif self.difficulty == AIDifficulty.HARD:
            return self._get_hard_shot(board_size)
        else:  # EXPERT
            return self._get_expert_shot(board_size)
    
    def _get_random_shot(self, board_size: int) -> Tuple[int, int]:
        """Easy mode: completely random shots"""
        while True:
            row = random.randint(0, board_size - 1)
            col = random.randint(0, board_size - 1)
            if (row, col) not in self.shot_history:
                self.shot_history.add((row, col))
                return row, col
    
    def _get_medium_shot(self, board_size: int) -> Tuple[int, int]:
        """Medium mode: random + target tracking after hits"""
        # If we have targets to follow up on, prioritize them
        if self.target_queue:
            row, col = self.target_queue.pop(0)
            if (row, col) not in self.shot_history:
                self.shot_history.add((row, col))
                return row, col
        
        # Otherwise, random shot
        return self._get_random_shot(board_size)
    
    def _get_hard_shot(self, board_size: int) -> Tuple[int, int]:
        """Hard mode: checkerboard pattern + smart targeting"""
        # If we have specific targets, prioritize them
        if self.target_queue:
            row, col = self.target_queue.pop(0)
            if (row, col) not in self.shot_history:
                self.shot_history.add((row, col))
                return row, col
        
        # If in hunt mode, use hunt targets
        if self.hunt_mode and self.hunt_targets:
            row, col = self.hunt_targets.pop(0)
            if (row, col) not in self.shot_history:
                self.shot_history.add((row, col))
                return row, col
        
        # Use checkerboard pattern for efficient hunting
        shot = self._get_checkerboard_shot(board_size)
        if shot:
            self.shot_history.add(shot)
            return shot
        
    def _get_expert_shot(self, board_size: int) -> Tuple[int, int]:
        """Expert mode: Advanced probability-based targeting with ship size analysis"""
        # If we have specific targets, prioritize them with intelligent ordering
        if self.target_queue:
            # Sort targets by probability (closer to known hits first)
            self.target_queue.sort(key=lambda pos: self._calculate_target_priority(pos))
            row, col = self.target_queue.pop(0)
            if (row, col) not in self.shot_history:
                self.shot_history.add((row, col))
                return row, col
        
        # Use probability density function for ship placement
        best_shot = self._get_highest_probability_shot(board_size)
        if best_shot:
            self.shot_history.add(best_shot)
            return best_shot
        
        # Fallback to checkerboard if probability analysis fails
        shot = self._get_checkerboard_shot(board_size)
        if shot:
            self.shot_history.add(shot)
            return shot
        
        # Final fallback to random
        return self._get_random_shot(board_size)
    
    def _calculate_target_priority(self, pos: Tuple[int, int]) -> float:
        """Calculate priority score for a target position"""
        row, col = pos
        priority = 0.0
        
        # Higher priority for positions adjacent to recent hits
        for hit_row, hit_col in self.hit_sequence[-3:]:  # Consider last 3 hits
            distance = abs(row - hit_row) + abs(col - hit_col)
            if distance == 1:
                priority += 10.0
            elif distance == 2:
                priority += 5.0
        
        return priority
    
    def _get_highest_probability_shot(self, board_size: int) -> Optional[Tuple[int, int]]:
        """Get shot with highest probability of hitting a ship"""
        probability_map = [[0.0 for _ in range(board_size)] for _ in range(board_size)]
        
        # Calculate probability for each position
        for row in range(board_size):
            for col in range(board_size):
                if (row, col) not in self.shot_history:
                    probability_map[row][col] = self._calculate_position_probability(row, col, board_size)
        
        # Find position with highest probability
        max_prob = 0.0
        best_pos = None
        
        for row in range(board_size):
            for col in range(board_size):
                if probability_map[row][col] > max_prob:
                    max_prob = probability_map[row][col]
                    best_pos = (row, col)
        
        return best_pos
    
    def _calculate_position_probability(self, row: int, col: int, board_size: int) -> float:
        """Calculate probability that a ship occupies this position"""
        if (row, col) in self.shot_history:
            return 0.0
        
        probability = 0.0
        
        # Base probability for checkerboard pattern
        if (row + col) % 2 == 0:
            probability += 1.0
        
        # Bonus for positions that could complete ship patterns
        for ship_size in self.ship_sizes:
            # Check horizontal placement possibilities
            for start_col in range(max(0, col - ship_size + 1), min(board_size - ship_size + 1, col + 1)):
                if self._could_fit_ship_horizontal(row, start_col, ship_size, board_size):
                    probability += 0.5
            
            # Check vertical placement possibilities
            for start_row in range(max(0, row - ship_size + 1), min(board_size - ship_size + 1, row + 1)):
                if self._could_fit_ship_vertical(start_row, col, ship_size, board_size):
                    probability += 0.5
        
        return probability
    
    def _could_fit_ship_horizontal(self, row: int, start_col: int, ship_size: int, board_size: int) -> bool:
        """Check if a ship could fit horizontally at this position"""
        if start_col + ship_size > board_size:
            return False
        
        for c in range(start_col, start_col + ship_size):
            if (row, c) in self.shot_history:
                # If we hit this position, it must be a hit (not a miss)
                # This is a simplified check - in real implementation, we'd track hits vs misses
                pass
        
        return True
    
    def _could_fit_ship_vertical(self, start_row: int, col: int, ship_size: int, board_size: int) -> bool:
        """Check if a ship could fit vertically at this position"""
        if start_row + ship_size > board_size:
            return False
        
        for r in range(start_row, start_row + ship_size):
            if (r, col) in self.shot_history:
                # If we hit this position, it must be a hit (not a miss)
                # This is a simplified check - in real implementation, we'd track hits vs misses
                pass
        
        return True
    
    def _get_checkerboard_shot(self, board_size: int) -> Optional[Tuple[int, int]]:
        """Get next shot using checkerboard pattern (most efficient for ship hunting)"""
        for row in range(board_size):
            for col in range(board_size):
                # Checkerboard pattern: (row + col) % 2 == 0
                if (row + col) % 2 == 0 and (row, col) not in self.shot_history:
                    return row, col
        return None
    
    def notify_shot_result(self, row: int, col: int, hit: bool, ship_sunk: bool = False):
        """Notify AI of shot result to update strategy"""
        if hit:
            self.last_hit = (row, col)
            self.hit_sequence.append((row, col))
            
            if ship_sunk:
                # Ship sunk, clear targets and reset hunt mode
                self.target_queue.clear()
                self.hunt_mode = False
                self.hunt_targets.clear()
                # Keep hit sequence for expert mode analysis
                if self.difficulty != AIDifficulty.EXPERT:
                    self.hit_sequence.clear()
            else:
                # Hit but not sunk, add adjacent cells to target queue
                self._add_adjacent_targets(row, col)
                
                if self.difficulty in [AIDifficulty.HARD, AIDifficulty.EXPERT]:
                    self.hunt_mode = True
                    
                # For expert mode, analyze hit patterns
                if self.difficulty == AIDifficulty.EXPERT:
                    self._analyze_hit_pattern()
        else:
            # Miss - no special action needed for easy/medium
            if self.difficulty in [AIDifficulty.HARD, AIDifficulty.EXPERT] and not self.target_queue:
                # If no immediate targets, continue hunt mode
                self.hunt_mode = True
    
    def _analyze_hit_pattern(self):
        """Analyze hit sequence to predict ship orientation and add smart targets"""
        if len(self.hit_sequence) < 2:
            return
        
        # Check if last two hits form a line (horizontal or vertical)
        last_hit = self.hit_sequence[-1]
        prev_hit = self.hit_sequence[-2]
        
        row_diff = last_hit[0] - prev_hit[0]
        col_diff = last_hit[1] - prev_hit[1]
        
        # If hits are in a line, predict continuation
        if row_diff == 0 and abs(col_diff) == 1:
            # Horizontal line - add targets at both ends
            direction = 1 if col_diff > 0 else -1
            next_col = last_hit[1] + direction
            prev_col = prev_hit[1] - direction
            
            if 0 <= next_col <= 9:
                self.target_queue.insert(0, (last_hit[0], next_col))
            if 0 <= prev_col <= 9:
                self.target_queue.append((prev_hit[0], prev_col))
                
        elif col_diff == 0 and abs(row_diff) == 1:
            # Vertical line - add targets at both ends
            direction = 1 if row_diff > 0 else -1
            next_row = last_hit[0] + direction
            prev_row = prev_hit[0] - direction
            
            if 0 <= next_row <= 9:
                self.target_queue.insert(0, (next_row, last_hit[1]))
            if 0 <= prev_row <= 9:
                self.target_queue.append((prev_row, prev_hit[1]))
    
    def _add_adjacent_targets(self, row: int, col: int, board_size: int = 10):
        """Add adjacent cells to target queue for follow-up shots"""
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]  # right, left, down, up
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            if (0 <= new_row < board_size and 
                0 <= new_col < board_size and 
                (new_row, new_col) not in self.shot_history):
                
                # For expert mode, use smarter targeting
                if self.difficulty == AIDifficulty.EXPERT:
                    # Prioritize based on hit pattern analysis
                    priority = self._calculate_target_priority((new_row, new_col))
                    if priority > 5.0:  # High priority targets go first
                        self.target_queue.insert(0, (new_row, new_col))
                    else:
                        self.target_queue.append((new_row, new_col))
                elif self.difficulty == AIDifficulty.HARD:
                    self.target_queue.insert(0, (new_row, new_col))
                else:
                    self.target_queue.append((new_row, new_col))
    
    def get_strategy_description(self) -> str:
        """Get current AI strategy description"""
        if self.hunt_mode:
            return f"🎯 Hunt Mode: Tracking {len(self.target_queue)} targets"
        elif len(self.hit_sequence) > 0:
            return f"🔍 Following up on {len(self.hit_sequence)} hits"
        else:
            return "🌊 Searching for ships"
    
    def predict_next_moves(self, num_moves: int = 3) -> List[Tuple[int, int]]:
        """Predict next few moves for advanced players to see AI strategy"""
        if self.difficulty != AIDifficulty.EXPERT:
            return []
        
        predicted_moves = []
        temp_queue = self.target_queue.copy()
        temp_history = self.shot_history.copy()
        
        for _ in range(min(num_moves, 10)):  # Limit to prevent infinite loops
            if temp_queue:
                move = temp_queue.pop(0)
                if move not in temp_history:
                    predicted_moves.append(move)
                    temp_history.add(move)
            else:
                # Use probability analysis for next move
                best_shot = self._get_highest_probability_shot(10)
                if best_shot and best_shot not in temp_history:
                    predicted_moves.append(best_shot)
                    temp_history.add(best_shot)
                else:
                    break
        
        return predicted_moves
    
    def reset(self):
        """Reset AI state for new game"""
        self.last_hit = None
        self.target_queue.clear()
        self.shot_history.clear()
        self.hunt_mode = False
        self.hunt_targets.clear()
        self.hit_sequence.clear()
        self.probable_ship_positions.clear()
    
    def get_difficulty_description(self) -> str:
        """Get human-readable description of AI difficulty"""
        descriptions = {
            AIDifficulty.EASY: "Easy - Random shots only",
            AIDifficulty.MEDIUM: "Medium - Random shots with target tracking",
            AIDifficulty.HARD: "Hard - Strategic hunting with checkerboard pattern",
            AIDifficulty.EXPERT: "Expert - Advanced probability analysis and pattern recognition"
        }
        return descriptions[self.difficulty]
    
    def get_ai_stats(self) -> dict:
        """Get AI performance statistics"""
        total_shots = len(self.shot_history)
        hits = len(self.hit_sequence)
        
        return {
            "difficulty": self.difficulty.value,
            "total_shots": total_shots,
            "hits": hits,
            "hit_rate": (hits / total_shots * 100) if total_shots > 0 else 0,
            "current_targets": len(self.target_queue),
            "hunt_mode": self.hunt_mode,
            "strategy_description": self.get_strategy_description(),
            "hit_sequence_length": len(self.hit_sequence),
            "predicted_moves": self.predict_next_moves(3) if self.difficulty == AIDifficulty.EXPERT else []
        }

