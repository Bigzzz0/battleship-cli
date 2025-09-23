
import random

class Board:
    def __init__(self):
        self.ships_board = [['O'] * 10 for _ in range(10)]
        self.ships = {
            "submarine": 3,
            "patrol_boat": 2,
            "Carrier": 5,
            "Battleship": 4,
            "Cruiser": 3,
            "Destroyer": 2
        }
        self._initialize_ship_tracking()

    def _initialize_ship_tracking(self) -> None:
        """รีเซ็ตข้อมูลตำแหน่งเรือและสถานะที่ยังไม่ถูกยิง"""
        self.ships_position = {
            "submarine": [],
            "patrol_boat": [],
            "Carrier": [],
            "Battleship": [],
            "Cruiser": [],
            "Destroyer": []
        }
        self.remaining_ship_positions = {
            ship: set()
            for ship in self.ships.keys()
        }

    def print_board(self, Debug=False) -> None:
        """
            Prints the game board to the console and ship positions in human-readable format.
            (This method is primarily for console debugging and will be replaced by API responses)
        """
        board_to_print = self.ships_board
        print("  " + " ".join("ABCDEFGHIJ"))
        for i, row in enumerate(board_to_print):
            print(f"{i+1:<2}" + " ".join(row))
        if Debug:
            readable_positions = {
                ship: [f"{chr(c + ord('A'))} {r + 1}" for r, c in positions]
                for ship, positions in self.ships_position.items()
            }
            print(readable_positions)

    def place_ships_randomly(self) -> None:
        """
            random place ship in board
        """
        self._initialize_ship_tracking()

        for ship_name, size in self.ships.items():
            placed = False
            while not placed:
                orientation = random.choice(['H', 'V'])
                if orientation == 'H':
                    row = random.randint(0, 9)
                    col = random.randint(0, 10 - size)
                    location = [(row, c) for c in range(col, col + size)]
                    if self.is_valid_placement(location):
                        self.ships_position[ship_name] = location
                        self.remaining_ship_positions[ship_name] = set(location)
                        placed = True
                else:
                    row = random.randint(0, 10 - size)
                    col = random.randint(0, 9)
                    location = [(r, col) for r in range(row, row + size)]
                    if self.is_valid_placement(location):
                        self.ships_position[ship_name] = location
                        self.remaining_ship_positions[ship_name] = set(location)
                        placed = True

    def is_valid_placement(self, location: list) -> bool:
        for ship_positions in self.ships_position.values():
            for loc in location:
                if loc in ship_positions:
                    return False
        return True

    def take_shot(self, row: int, col: int) -> dict:
        """
        Processes a shot at the given coordinates on the ships_board.

        Args:
            row (int): The row index of the shot.
            col (int): The column index of the shot.

        Returns:
            dict: A dictionary containing shot result (hit/miss) and updated board state.
        """
        if self.ships_board[row][col] == 'H' or self.ships_board[row][col] == 'M':
            return {
                "status": "already_shot", 
                "message": "You already shot at this position.",
                "ship_sunk": False,
                "all_ships_sunk": self.all_ships_sunk()
            }

        for ship_name, positions in self.ships_position.items():
            if (row, col) in positions:
                self.ships_board[row][col] = 'H'  # Mark only the hit part

                if ship_name in self.remaining_ship_positions:
                    self.remaining_ship_positions[ship_name].discard((row, col))

                # Check if the entire ship is sunk
                is_sunk = len(self.remaining_ship_positions.get(ship_name, set())) == 0

                if is_sunk:
                    # รีเซ็ตตำแหน่งที่เหลือให้ว่างแต่ยังคงข้อมูลสำหรับ debug/display
                    self.remaining_ship_positions[ship_name] = set()
                    return {
                        "status": "hit",
                        "message": f"Hit! You sunk {ship_name}.",
                        "ship_sunk": True,
                        "sunk_ship_name": ship_name,
                        "all_ships_sunk": self.all_ships_sunk()
                    }
                else:
                    return {
                        "status": "hit", 
                        "message": "Hit!", 
                        "ship_sunk": False,
                        "all_ships_sunk": self.all_ships_sunk()
                    }

        self.ships_board[row][col] = 'M'
        return {
            "status": "miss", 
            "message": "Miss!", 
            "ship_sunk": False,
            "all_ships_sunk": self.all_ships_sunk()
        }

    def all_ships_sunk(self) -> bool:
        """
        Checks if all ships on the board have been sunk.

        Returns:
            bool: True if there are no ship left on the board, False otherwise.
        """
        return all(len(positions) == 0 for positions in self.remaining_ship_positions.values())

    def get_board_state(self) -> list[list[str]]:
        """
        Returns the current state of the board.
        """
        return self.ships_board

    def get_ships_remaining(self) -> dict:
        """
        Returns the names of the ships that are still afloat.
        """
        return [
            ship_name
            for ship_name, positions in self.remaining_ship_positions.items()
            if len(positions) > 0
        ]
    
    def can_place_ship(self, start_row: int, start_col: int, size: int, direction: str) -> bool:
        """ตรวจสอบว่าสามารถวางเรือได้หรือไม่"""
        if direction == 'horizontal':
            if start_col + size > 10:
                return False
            location = [(start_row, start_col + i) for i in range(size)]
        else:  # vertical
            if start_row + size > 10:
                return False
            location = [(start_row + i, start_col) for i in range(size)]
        
        return self.is_valid_placement(location)
    
    def place_ship_at_position(self, ship_name: str, start_row: int, start_col: int, size: int, direction: str) -> bool:
        """วางเรือในตำแหน่งที่กำหนด"""
        if not self.can_place_ship(start_row, start_col, size, direction):
            return False
        
        if direction == 'horizontal':
            location = [(start_row, start_col + i) for i in range(size)]
        else:  # vertical
            location = [(start_row + i, start_col) for i in range(size)]
        
        self.ships_position[ship_name] = location
        self.remaining_ship_positions[ship_name] = set(location)
        return True

    def clear_ships(self):
        """ล้างเรือทั้งหมด"""
        self._initialize_ship_tracking()
    
    def place_ships_custom(self, ship_placements: list) -> dict:
        """
        วางเรือตามที่ผู้เล่นกำหนด
        
        Args:
            ship_placements: list ของ dict ที่มี ship_name, start_row, start_col, direction
        
        Returns:
            dict ที่มี success และ message
        """
        self.clear_ships()
        
        # ตรวจสอบว่ามีเรือครบ
        expected_ships = set(self.ships.keys())
        provided_ships = set([ship["ship_name"] for ship in ship_placements])
        
        if expected_ships != provided_ships:
            return {"success": False, "message": f"ต้องมีเรือ: {list(expected_ships)}"}
        
        # วางเรือทีละลำ
        for ship in ship_placements:
            ship_name = ship["ship_name"]
            size = self.ships[ship_name]
            
            if not self.place_ship_at_position(ship_name, ship["start_row"], ship["start_col"], size, ship["direction"]):
                self.clear_ships()
                return {"success": False, "message": f"ไม่สามารถวางเรือ {ship_name} ที่ตำแหน่ง ({ship['start_row']}, {ship['start_col']}) ได้"}
        
        return {"success": True, "message": "วางเรือสำเร็จ"}


