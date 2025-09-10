from Board import Board
from Tool import parse_position,is_valid_position
class BattleShipGame:
    
    def __init__(self):
        '''
            Board is Created\n
            Obj.startGame() to Enjoy.
        '''
        self.player_board = Board()
    
    def startGame(self,Debug = False)->None:
        '''
            Start Play BattleShipGame Enjoy :).
        '''
        print("Battleship Game")
        print("Welcome to this game")
        print("You are the gunner, your mission is to sink all the ships")
        
        self.player_board.place_ships_randomly()
        
        self.player_board.print_board(Debug)
        
        while not self.player_board.all_ships_sunk():
            position = input("Enter row and column or quit(e.g. A1-j10): ")
            if position.lower() == "quit":
                print("You quit the game has stop")
                break
            if len(position) != 2 and not (len(position) == 3 and (position[1:3] == "10" or position[0:2] == "10")):
                print("Input cannot be empty. Please try again.")
                continue
            r,c = position[0],position[1]
            if (len(position) == 3 and (position[1:3] == "10" or position[0:2] == "10")):
                if position[1:3] == "10":
                    r,c = position[0],position[1:3]
                else:
                    r,c = position[0:2],position[2]
            if not is_valid_position(r, c):
                print("Invalid input! Please enter a letter A-J and a number 1-10.")
                continue
            row, col = parse_position(r, c)
            self.player_board.take_shot(row, col)
            self.player_board.print_board(Debug)

        if self.player_board.all_ships_sunk():
            print("All ships have been sunk! You win!")
        #You can run this file to play the game in the console
        
    