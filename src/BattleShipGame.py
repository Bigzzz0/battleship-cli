import random

class BoardGame:
    def __init__(self):
        self.ships_board = [['O'] * 10 for _ in range(10)]
        self.ships = {
            "Destroyer":3,
            "submarine":3,
            "patrol_boat":2
        }
        self.ships_position = {
            "Destroyer":[],
            "submarine":[],
            "patrol_boat":[]
        }
     
    def print_board(self):
        """
        Prints the game board to the console.
        """
        board_to_print = self.ships_board
        print("  " + " ".join("ABCDEFGHIJ"))
        for i, row in enumerate(board_to_print):
            print(f"{i+1:<2}" + " ".join(row))
        print(self.ships_position)
            
    def place_ships_randomly(self):
        """
        random place ship in board
        """
        for ship_name,size in self.ships.items():
            placed = False
            while not placed:
                orientation = random.choice(['H', 'V'])
                if orientation == 'H':
                    row = random.randint(0, 9)
                    col = random.randint(0, 10 - size)
                    for position in self.ships_position.values():
                        if not (row,col) in position:
                            self.ships_position[ship_name] =  [(row,c) for c in range(col, col + size)]
                            placed = True
                else:
                    row = random.randint(0, 10 - size)
                    col = random.randint(0, 9)
                    for position in self.ships_position.values():
                        if not (row,col) in position:
                            self.ships_position[ship_name] =  [(r,col) for r in range(row, row + size)]
                            placed = True
                    
    def take_shot(self, row:int, col:int)->bool:
        """
        Processes a shot at the given coordinates on the ships_board.
        
        Args:
            row (int): The row index of the shot.
            col (int): The column index of the shot.
            
        Returns:
            bool: True if the shot was a hit, False otherwise.
        """
        for ship_name,position in self.ships_position.items():
            if (row,col) in position:
                for r,c in position:
                    self.ships_board[r][c] = 'H'
                del self.ships_position[ship_name]
                return True
        self.ships_board[row][col] = 'M'
        return False
        
    def all_ships_sunk(self)->bool:
        """
        Checks if all ships on the board have been sunk.
        
        Returns:
            bool: True if there are no ship left on the board, False otherwise.
        """
        if len(self.ships_position) == 0:
            return True
        return False