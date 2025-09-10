import unittest
import sys
from io import StringIO
from unittest.mock import patch, MagicMock
from BattleShip import BattleShipGame
from Board import Board

# Mock the Board class to control its behavior in tests
class MockBoard(Board):
    def __init__(self):
        super().__init__()
        self.ships_position = {}
        self.ships = {
            "submarine":3,
            "patrol_boat":2,
            "Carrier": 5,
            "Battleship": 4,
            "Cruiser": 3,
            "Destroyer": 2
        }
        self.ships_sunk = 0
        
    def place_ships_randomly(self):
        pass

    def take_shot(self, row, col):
        # A simple mock behavior for a hit
        if (row, col) == (0, 0):
            self.ships_sunk += 1
            return True
        return False
        
    def all_ships_sunk(self):
        # Returns True when a certain number of shots have been "hit"
        # We can control this for testing the win condition
        return self.ships_sunk >= 1

    def print_board(self, Debug=False):
        pass

# Mock the Tool module
class MockTool:
    def __init__(self):
        pass
    def parse_position(self, pos1: str, pos2: str) -> tuple:
        # Mock valid positions to simplify tests
        if pos1 == 'A' and pos2 == '1':
            return (0, 0)
        return (-1, -1) # Default for invalid
    
    def is_valid_position(self, pos1: str, pos2: str) -> bool:
        # Mock valid inputs
        if pos1 == 'A' and pos2 == '1':
            return True
        if pos1 == 'J' and pos2 == '10':
            return True
        if pos1 == '10' and pos2 == 'J':
            return True
        return False

@patch('BattleShip.Board', new=MockBoard)
@patch('BattleShip.parse_position', new=MockTool.parse_position)
@patch('BattleShip.is_valid_position', new=MockTool.is_valid_position)
class TestBattleShipGame(unittest.TestCase):
    
    def setUp(self):
        self.game = BattleShipGame()
        
    def test_startGame_with_quit(self):
        """
        Test that the game loop breaks when the user inputs 'quit'.
        """
        # Mock the input function to simulate 'quit'
        with patch('builtins.input', return_value='quit'):
            with patch('sys.stdout', new=StringIO()) as mock_stdout:
                self.game.startGame()
                output = mock_stdout.getvalue()
                self.assertIn("You quit the game has stop", output)

    def test_startGame_invalid_input(self):
        """
        Test that invalid inputs are handled correctly in the game loop.
        """
        # Mock input to test an invalid entry, then a valid one to exit loop
        user_inputs = ["X9", "A1"]
        with patch('builtins.input', side_effect=user_inputs) as mock_input:
            with patch.object(self.game.player_board, 'all_ships_sunk', side_effect=[False, False, True]):
                with patch('sys.stdout', new=StringIO()) as mock_stdout:
                    self.game.startGame()
                    output = mock_stdout.getvalue()
                    self.assertIn("Invalid input! Please enter a letter A-J and a number 1-10.", output)

    def test_startGame_win_condition(self):
        """
        Test that the win condition is met when all ships are sunk.
        """
        # Mock all_ships_sunk to return True after the first shot
        with patch('builtins.input', return_value='A1'):
            with patch.object(self.game.player_board, 'all_ships_sunk', side_effect=[False, True]):
                with patch('sys.stdout', new=StringIO()) as mock_stdout:
                    self.game.startGame()
                    output = mock_stdout.getvalue()
                    self.assertIn("All ships have been sunk! You win!", output)

if __name__ == '__main__':
    unittest.main()