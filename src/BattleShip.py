import Board
class BattleShipGame:
    
    def __init__(self):
        '''
            Board is Created\n
            Obj.startGame() to Enjoy.
        '''
        self.player_board = Board.Board()
    
    def startGame(self)->None:
        '''
            Start Play BattleShipGame Enjoy :).
        '''
        print("Battleship Game")
        print("Welcome to this game")
        print("You are the gunner, your mission is to sink all the ships")
        
        self.player_board.place_ships_randomly()
        
        self.player_board.print_board()
        
        while not self.player_board.all_ships_sunk():
            position = input("Enter row and column or quit(e.g. A1-j10): ")
            if position.lower() == "quit":
                print("You quit the game has stop")
                break
            if len(position) != 2:
                print("Input cannot be empty. Please try again.")
                continue
            if not self.is_valid_position(position[0], position[1]):
                print("Invalid input! Please enter a letter A-J and a number 1-10.")
                continue
            row, col = self.parse_position(position[0], position[1])
            self.player_board.take_shot(row, col)
            self.player_board.print_board()

        if self.player_board.all_ships_sunk():
            print("All ships have been sunk! You win!")
        #You can run this file to play the game in the console
        
    def parse_position(self,pos1:str, pos2:str)->tuple:
        '''
        if pos1 = str than pos2 = int
        or pos2 = int than pos1 = str\n
        RETURN (int,int)
        '''
        # If pos1 is a letter, it's the column; if it's a digit, it's the row
        if pos1.isalpha():
            col = ord(pos1.upper()) - ord('A')
            row = int(pos2) - 1
        else:
            row = int(pos1) - 1
            col = ord(pos2.upper()) - ord('A')
        return row, col

    def is_valid_position(self,pos1:str, pos2:str)->bool:
        '''
            check if pos1 and pos2 are valid (A-J and 1-10)
        '''
        if pos1.isalpha():
            if pos1.upper() < 'A' or pos1.upper() > 'J':
                return False
            if not pos2.isdigit() or int(pos2) < 1 or int(pos2) > 10:
                return False
        elif pos1.isdigit():
            if int(pos1) < 1 or int(pos1) > 10:
                return False
            if not pos2.isalpha() or pos2.upper() < 'A' or pos2.upper() > 'J':
                return False
        else:
            return False
        return True