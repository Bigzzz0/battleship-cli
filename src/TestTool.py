import unittest
from Tool import parse_position, is_valid_position

class TestTool(unittest.TestCase):
    
    def test_parse_position(self):
        """
        Test the parse_position function with various valid inputs.
        """
        # Standard format like 'A1'
        row, col = parse_position('A', '1')
        self.assertEqual(row, 0)
        self.assertEqual(col, 0)

        # Case-insensitive
        row, col = parse_position('j', '10')
        self.assertEqual(row, 9)
        self.assertEqual(col, 9)

        # Reversed format like '10j'
        row, col = parse_position('10', 'j')
        self.assertEqual(row, 9)
        self.assertEqual(col, 9)
    
    def test_is_valid_position(self):
        """
        Test the is_valid_position function with various valid and invalid inputs.
        """
        # Valid cases
        self.assertTrue(is_valid_position('A', '1'))
        self.assertTrue(is_valid_position('J', '10'))
        self.assertTrue(is_valid_position('1', 'J'))
        self.assertTrue(is_valid_position('10', 'A'))
        
        # Invalid cases
        self.assertFalse(is_valid_position('K', '5'))     # Letter out of range
        self.assertFalse(is_valid_position('A', '11'))    # Number out of range
        self.assertFalse(is_valid_position('11', 'A'))    # Number out of range
        self.assertFalse(is_valid_position('A', 'B'))     # Number is not a digit
        self.assertFalse(is_valid_position('1', '2'))     # Both are digits
        self.assertFalse(is_valid_position('AA', '1'))    # pos1 too long
        self.assertFalse(is_valid_position('A', '100'))   # pos2 too long
        self.assertFalse(is_valid_position('12', 'A'))    # pos1 too long

if __name__ == '__main__':
    unittest.main()