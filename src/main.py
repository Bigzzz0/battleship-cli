import BattleShipGame
print("Battleship Game")
print("Welcome to this game")
print("You are the gunner, your mission is to sink all the ships")
player_board = BattleShipGame.BoardGame()

player_board.place_ships_randomly()
player_board.print_board()


def parse_position(pos1, pos2):
    # If pos1 is a letter, it's the column; if it's a digit, it's the row
    if pos1.isalpha():
        col = ord(pos1.upper()) - ord('A')
        row = int(pos2) - 1
    else:
        row = int(pos1) - 1
        col = ord(pos2.upper()) - ord('A')
    return row, col

def is_valid_position(pos1, pos2):
    #check if pos1 and pos2 are valid
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

while not player_board.all_ships_sunk():
    while True:
        pos1 = input("Enter row or column (e.g. A or 1): ")
        if not pos1:
            print("Input cannot be empty. Please try again.")
            player_board.print_board()
            continue
        pos1 = pos1[0]
        pos2 = input("Enter the other coordinate (e.g. 1 or A): ")
        if not pos2:
            print("Input cannot be empty. Please try again.")
            player_board.print_board()
            continue
        pos2 = pos2[0]
        if is_valid_position(pos1, pos2):
            break
        print("Invalid input! Please enter a letter A-J and a number 1-10.")
        player_board.print_board()
    row, col = parse_position(pos1, pos2)
    player_board.take_shot(row, col)
    player_board.print_board()

if player_board.all_ships_sunk():
    print("All ships have been sunk! You win!")
#You can run this file to play the game in the console