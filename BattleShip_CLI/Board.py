from Tool import ColorFront
import random

class Board:
    def __init__(self):
        self.ships_board = [['O'] * 10 for _ in range(10)]
        self.ships = {
            "submarine":3,
            "patrol_boat":2,
            "Carrier": 5,
            "Battleship": 4,
            "Cruiser": 3,
            "Destroyer": 2
        }
        self.ships_position = {
            "submarine":[],
            "patrol_boat":[],
            "Carrier": [],
            "Battleship": [],
            "Cruiser": [],
            "Destroyer": []
        }

    def print_board(self,Debug = False)->None:
        """
            Prints the game board to the console and ship positions in human-readable format.
        """
        board_to_print = self.ships_board
        print("  " + " ".join("ABCDEFGHIJ"))
        for i, row in enumerate(board_to_print):
            print(f"{i+1:<2}" + " ".join(row))
        # Print ships_position in readable format
        if Debug == True:
            readable_positions = {
                ship: [f"{chr(c + ord('A'))} {r + 1}" for r, c in positions]
                for ship, positions in self.ships_position.items()
            }
            print(readable_positions)

    def place_ships_randomly(self)->None:# H and V
        """
            random place ship in board
        """
        for ship_name,size in self.ships.items():
            placed = False
            while not placed:
                #สุ่มแนวตั้งแนวนอน
                orientation = random.choice(['H', 'V'])
                if orientation == 'H':
                    #แถวตั้ง
                    row = random.randint(0, 9)
                    col = random.randint(0, 10 - size)
                    #เช็คว่าทับเรือลำอื่นหรือปล่าว
                    location = [(row,c) for c in range(col, col + size)]
                    if self.is_valid_placement(location):
                        self.ships_position[ship_name] =  location
                        placed = True
                else:
                    #แถวนอน
                    row = random.randint(0, 10 - size)
                    col = random.randint(0, 9)
                    #เช็คว่าทับเรือลำอื่นหรือปล่าว
                    location = [(r,col) for r in range(row, row + size)]
                    if self.is_valid_placement(location):
                        self.ships_position[ship_name] =  location
                        placed = True

    def is_valid_placement(self, location:tuple)->bool:#detail
        for position in self.ships_position.values():
            for loc in location:
                if loc in position:
                    return False
        return True

    def take_shot(self, row:int, col:int) -> bool:
        """
        Processes a shot at the given coordinates on the ships_board.

        Args:
            row (int): The row index of the shot.
            col (int): The column index of the shot.

        Returns:
            bool: True if the shot was a hit, False otherwise.
        """
        if self.ships_board[row][col] == ColorFront("\033[32m","H") or self.ships_board[row][col] == ColorFront("\033[31m","M"):
            print("You already Hit that before.\n")
            return False
        for ship_name, position in self.ships_position.items():
            if (row, col) in position:
                for r, c in position:
                    self.ships_board[r][c] = ColorFront("\033[32m","H")
                print("Hit! You sunk " +ship_name+ ".\n")
                del self.ships_position[ship_name]
                return True
        self.ships_board[row][col] = ColorFront("\033[31m","M")
        print("Miss!.\n")
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

