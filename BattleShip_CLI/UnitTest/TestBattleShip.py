# Test BattleShipGame

import unittest
import sys
from io import StringIO
from unittest.mock import patch, MagicMock
from BattleShip import BattleShipGame

# Mock the Board class
class MockBoard(Board):
    def __init__(self):
        super().__init__()
        self.ships_position = {}
        self.ships_sunk = 0

    def place_ships_randomly(self):
        pass

    def take_shot(self, row, col):
        return True

    def all_ships_sunk(self):
        self.ships_sunk += 1
        return self.ships_sunk > 1

    def print_board(self, Debug=False):
        pass

# Mock the Tool module functions directly
# This is a better approach than creating a mock class
def mock_is_valid_position(pos1: str, pos2: str) -> bool:
    if pos1 == 'X' and pos2 == '9':
        return False  # Invalid input
    if pos1 == 'A' and pos2 == '1':
        return True   # Valid input
    if pos1 == '10' and pos2 == 'J':
        return True   # Valid input for '10J'
    if pos1 == 'J' and pos2 == '10':
        return True   # Valid input for 'J10'
    return False

def mock_parse_position(pos1: str, pos2: str) -> tuple:
    if pos1 == 'A' and pos2 == '1':
        return (0, 0)
    return (0, 0) # Fallback to a safe value

@patch('__main__.Board', new=MockBoard)
@patch('__main__.is_valid_position', new=mock_is_valid_position)
@patch('__main__.parse_position', new=mock_parse_position)
class TestBattleShipGame(unittest.TestCase):

    def setUp(self):
        self.game = BattleShipGame()

    # (Existing tests like test_startGame_with_quit remain the same)

    def test_startGame_invalid_input(self):
        """
        Test that invalid inputs are handled correctly in the game loop.
        """
        # We need to provide a series of inputs for the test
        user_inputs = ["X9", "A1", "quit"] # Add "quit" to safely exit the loop
        with patch('builtins.input', side_effect=user_inputs) as mock_input:
            with patch('sys.stdout', new=StringIO()) as mock_stdout:
                self.game.startGame()
                output = mock_stdout.getvalue()
                self.assertIn("Invalid input! Please enter a letter A-J and a number 1-10.", output)


    def test_startGame_win_condition(self):
        """
        Test that the win condition is met when all ships are sunk.
        """
        with patch('builtins.input', return_value='A1'):
            # แก้ไข side_effect เพื่อให้มีค่าเพียงพอต่อการเรียกใช้ในลูป
            # โดยการเรียกใช้ all_ships_sunk จะเกิดขึ้น 3 ครั้ง:
            # 1. ก่อนเข้าลูป (False)
            # 2. หลังยิงครั้งแรก (True)
            # 3. หลังลูปจบ (True)
            with patch.object(self.game.player_board, 'all_ships_sunk', side_effect=[False, True, True]):
                with patch('sys.stdout', new=StringIO()) as mock_stdout:
                    self.game.startGame()
                    output = mock_stdout.getvalue()
                    self.assertIn("All ships have been sunk! You win!", output)