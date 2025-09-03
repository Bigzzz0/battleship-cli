import random

class BoardGame:
    def __init__(self):
        self.ships_board = [['O'] * 10 for _ in range(10)]
        self.ships_number = 10
        self.ships_position = []
     
    def print_board(self):
        """
        Prints the game board to the console.
        
        Args:
            show_ships (bool): If True, prints the ships_board. If False,
                               prints the guesses_board.
        """
        board_to_print = self.ships_board
        print("  " + " ".join("ABCDEFGHIJ"))
        for i, row in enumerate(board_to_print):
            print(f"{i+1:<2}" + " ".join(row))
            
    def place_ships_randomly(self):
        for _ in range(self.ships_number):
            row = random.randint(0, 9)
            col = random.randint(0, 9)
            if not (row,col) in self.ships_position:
                self.ships_position.append((row,col))
                    
    def take_shot(self, row:int, col:int)->bool:
        """
        Processes a shot at the given coordinates on the ships_board.
        
        Args:
            row (int): The row index of the shot.
            col (int): The column index of the shot.
            
        Returns:
            bool: True if the shot was a hit, False otherwise.
        """
        if row > 10 and col > 10:
            print("input (0-9)")
            return False
        if (row,col) in self.ships_position:
            self.ships_board[row-1][col-1] = 'H'
            self.ships_position.remove((row,col))
            return True
        else:
            self.ships_board[row-1][col-1] = 'X'
            return False
    def all_ships_sunk(self):
        """
        Checks if all ships on the board have been sunk.
        
        Returns:
            bool: True if there are no 'S' marks left on the board, False otherwise.
        """
        if len(self.ships_position) == 0:
            return True
        return False