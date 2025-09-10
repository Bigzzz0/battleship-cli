import unittest
import random
from Board import Board

# Set a fixed seed for reproducibility of random ship placements
random.seed(42)

class TestBoard(unittest.TestCase):
    
    def setUp(self):
        """
        Set up a fresh Board instance for each test.
        """
        self.board = Board()
        
    def test_initialization(self):
        """
        Test that the board is correctly initialized.
        """
        self.assertEqual(len(self.board.ships_board), 10)
        self.assertEqual(len(self.board.ships_board[0]), 10)
        self.assertEqual(self.board.ships_board[5][5], 'O')
        self.assertIn("Destroyer", self.board.ships)
        self.assertIn("submarine", self.board.ships)
        self.assertIn("patrol_boat", self.board.ships)
        self.assertEqual(self.board.ships_position["Destroyer"], [])
        
    def test_place_ships_randomly(self):
        """
        Test that all ships are placed after calling the method.
        """
        self.board.place_ships_randomly()
        
        # Check that ships_position is no longer empty
        self.assertGreater(len(self.board.ships_position["Destroyer"]), 0)
        self.assertGreater(len(self.board.ships_position["submarine"]), 0)
        self.assertGreater(len(self.board.ships_position["patrol_boat"]), 0)
        
        # Check that the number of placed ship segments matches the size
        total_segments = sum(len(positions) for positions in self.board.ships_position.values())
        expected_segments = self.board.ships["Destroyer"] + self.board.ships["submarine"] + self.board.ships["patrol_boat"]
        self.assertEqual(total_segments, expected_segments)

    def test_is_valid_placement(self):
        """
        Test the logic for checking valid ship placements.
        """
        # Test a valid placement
        self.assertTrue(self.board.is_valid_placement([(0, 0), (0, 1)]))

        # Place a ship and test for overlap
        self.board.ships_position["Destroyer"] = [(0, 0), (0, 1), (0, 2)]
        
        # Test an invalid placement that overlaps with an existing ship
        self.assertFalse(self.board.is_valid_placement([(0, 1), (0, 2)]))
        
        # Test another invalid placement
        self.assertFalse(self.board.is_valid_placement([(0, 0)]))
        
        # Test a valid placement that doesn't overlap
        self.assertTrue(self.board.is_valid_placement([(1, 0), (1, 1)]))

    def test_take_shot_hit(self):
        """
        Test the take_shot method for a hit.
        """
        # Place a ship manually to ensure a hit
        self.board.ships_position["patrol_boat"] = [(0, 0), (0, 1)]
        
        # Take a shot that is a hit
        is_hit = self.board.take_shot(0, 0)
        
        # Assertions
        self.assertTrue(is_hit)
        
        # The ship should be removed from ships_position because its entire length is hit at once
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

    def test_all_ships_sunk(self):
        """
        Test the all_ships_sunk method.
        """
        # Initially, no ships are placed, so it should be false
        self.assertFalse(self.board.all_ships_sunk())
        
        # Place a ship, it should still be false
        self.board.ships_position["patrol_boat"] = [(0, 0), (0, 1)]
        self.assertFalse(self.board.all_ships_sunk())
        
        # Simulate sinking the ship by clearing ships_position
        del self.board.ships_position["patrol_boat"]
        self.assertFalse(self.board.all_ships_sunk())
        
        # Now clear the rest of the ships
        del self.board.ships_position["Destroyer"]
        del self.board.ships_position["submarine"]

        # Now all ships are "sunk" and it should be true
        self.assertTrue(self.board.all_ships_sunk())

if __name__ == '__main__':
    unittest.main()