import Board

for _ in range(100):
    board = Board.Board()
    board.place_ships_randomly()
    print(board.ships_position)
        
    