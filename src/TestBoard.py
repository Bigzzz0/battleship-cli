import unittest
import random
import sys
from unittest.mock import patch, MagicMock
from io import StringIO
from Board import Board

# Set a fixed seed for reproducibility of random ship placements
random.seed(42)

class TestBoard(unittest.TestCase):
    
    def setUp(self):
        """
        Set up a fresh Board instance for each test.
        """
        self.board = Board()
        
    def test_initialization_and_ships(self):
        """
        Test that the board is correctly initialized with the updated ship list.
        """
        self.assertEqual(len(self.board.ships_board), 10)
        self.assertEqual(len(self.board.ships_board[0]), 10)
        self.assertEqual(self.board.ships_board[5][5], 'O')
        self.assertIn("Carrier", self.board.ships)
        self.assertIn("Battleship", self.board.ships)
        self.assertIn("Cruiser", self.board.ships)
        self.assertIn("Destroyer", self.board.ships)
        self.assertIn("submarine", self.board.ships)
        self.assertIn("patrol_boat", self.board.ships)

    def test_place_ships_randomly(self):
        """
        Test that all ships are placed after calling the method.
        """
        self.board.place_ships_randomly()
        
        # Check that ships_position is no longer empty
        self.assertGreater(len(self.board.ships_position["Carrier"]), 0)
        self.assertGreater(len(self.board.ships_position["Battleship"]), 0)
        self.assertGreater(len(self.board.ships_position["Cruiser"]), 0)
        self.assertGreater(len(self.board.ships_position["Destroyer"]), 0)
        self.assertGreater(len(self.board.ships_position["submarine"]), 0)
        self.assertGreater(len(self.board.ships_position["patrol_boat"]), 0)
        
        # Check that the number of placed ship segments matches the total size
        total_segments = sum(len(positions) for positions in self.board.ships_position.values())
        expected_segments = sum(self.board.ships.values())
        self.assertEqual(total_segments, expected_segments)

    def test_is_valid_placement(self):
        """
        Test the logic for checking valid ship placements.
        """
        # Test a valid placement
        self.assertTrue(self.board.is_valid_placement([(0, 0), (0, 1)]))

        # Place a ship and test for overlap
        self.board.ships_position["Destroyer"] = [(0, 0), (0, 1)]
        
        # Test an invalid placement that overlaps with an existing ship
        self.assertFalse(self.board.is_valid_placement([(0, 1), (0, 2)]))
        
        # Test a valid placement that doesn't overlap
        self.assertTrue(self.board.is_valid_placement([(1, 0), (1, 1)]))

    def test_take_shot_hit(self):
        """
        Test the take_shot method for a hit and sinking a ship.
        """
        # Manually place a ship to ensure a hit
        self.board.ships_position["patrol_boat"] = [(0, 0), (0, 1)]
        
        # Take a shot that is a hit
        is_hit = self.board.take_shot(0, 0)
        
        # Assertions
        self.assertTrue(is_hit)
        self.assertNotIn("patrol_boat", self.board.ships_position)

    def test_take_shot_miss(self):
        """
        Test the take_shot method for a miss.
        """
        # Place a ship to ensure a miss
        self.board.ships_position["patrol_boat"] = [(0, 0), (0, 1)]
        
        # Take a shot that is a miss
        is_hit = self.board.take_shot(5, 5)
        
        # Assertions
        self.assertFalse(is_hit)
        self.assertIn("patrol_boat", self.board.ships_position)
        
    def test_take_shot_already_hit(self):
        """
        Test that `take_shot` returns False if a coordinate has already been hit.
        """
        with patch('Tool.ColorFront', side_effect=lambda color, data: f"{color}{data}\033[0m"):
            self.board.ships_board[0][0] = "\033[32mH\033[0m"
            is_hit = self.board.take_shot(0, 0)
            self.assertFalse(is_hit)

    def test_all_ships_sunk(self):
        """
        Test the all_ships_sunk method.
        """
        # Initially, no ships are placed, so it should be false
        self.assertFalse(self.board.all_ships_sunk())
        
        # Place ships
        self.board.ships_position = {
            "Destroyer": [(0, 0), (0, 1)],
            "patrol_boat": [(1, 0), (1, 1)]
        }
        self.assertFalse(self.board.all_ships_sunk())
        
        # Simulate sinking all ships by clearing ships_position
        self.board.ships_position.clear()
        
        # Now all ships are "sunk" and it should be true
        self.assertTrue(self.board.all_ships_sunk())


if __name__ == '__main__':
    unittest.main()