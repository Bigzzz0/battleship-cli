import BattleShipGame
print("Battleship Game")
print("Welcome to this game")

player_board = BattleShipGame.BoardGame()

player_board.print_board()
player_board.place_ships_randomly()

while not player_board.all_ships_sunk():
  x = int(input("input position: "))
  y = int(input("input position: "))
  player_board.take_shot(x,y)
  player_board.print_board()