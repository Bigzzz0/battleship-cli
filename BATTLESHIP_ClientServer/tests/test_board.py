import random

import pytest

from app.models.board import Board


@pytest.fixture
def deterministic_board():
    random.seed(1)
    board = Board()
    return board


def test_place_ships_randomly_produces_unique_cells(deterministic_board):
    deterministic_board.place_ships_randomly()

    occupied_cells = []
    for positions in deterministic_board.ships_position.values():
        occupied_cells.extend(positions)

    assert len(occupied_cells) == sum(deterministic_board.ships.values())
    assert len(occupied_cells) == len(set(occupied_cells)), "Ships should not overlap when placed randomly"


def test_take_shot_hits_and_sinks_ship(deterministic_board):
    # Clear current ships and place a destroyer manually
    deterministic_board.clear_ships()
    placed = deterministic_board.place_ship_at_position(
        "Destroyer", start_row=0, start_col=0, size=deterministic_board.ships["Destroyer"], direction="horizontal"
    )
    assert placed

    # First hit should mark the board and not sink the ship
    first_shot = deterministic_board.take_shot(0, 0)
    assert first_shot["status"] == "hit"
    assert first_shot["ship_sunk"] is False
    assert deterministic_board.ships_board[0][0] == "H"

    # Second hit should sink the destroyer
    second_shot = deterministic_board.take_shot(0, 1)
    assert second_shot["status"] == "hit"
    assert second_shot["ship_sunk"] is True
    assert second_shot["sunk_ship_name"] == "Destroyer"
    assert second_shot["all_ships_sunk"] is True


def test_take_shot_prevents_duplicate_attempts(deterministic_board):
    deterministic_board.clear_ships()
    deterministic_board.place_ship_at_position(
        "Destroyer", start_row=0, start_col=0, size=deterministic_board.ships["Destroyer"], direction="horizontal"
    )

    deterministic_board.take_shot(0, 0)
    repeat_shot = deterministic_board.take_shot(0, 0)

    assert repeat_shot["status"] == "already_shot"
    assert "already" in repeat_shot["message"].lower()


def test_place_ships_custom_success(deterministic_board):
    custom_ships = [
        {"ship_name": "Carrier", "start_row": 0, "start_col": 0, "direction": "horizontal"},
        {"ship_name": "Battleship", "start_row": 2, "start_col": 0, "direction": "horizontal"},
        {"ship_name": "Cruiser", "start_row": 4, "start_col": 0, "direction": "horizontal"},
        {"ship_name": "submarine", "start_row": 6, "start_col": 0, "direction": "horizontal"},
        {"ship_name": "Destroyer", "start_row": 8, "start_col": 0, "direction": "horizontal"},
        {"ship_name": "patrol_boat", "start_row": 9, "start_col": 3, "direction": "horizontal"},
    ]

    result = deterministic_board.place_ships_custom(custom_ships)
    assert result["success"] is True
    assert result["message"] == "วางเรือสำเร็จ"


def test_place_ships_custom_detects_overlap(deterministic_board):
    overlapping_custom_ships = [
        {"ship_name": "Carrier", "start_row": 0, "start_col": 0, "direction": "horizontal"},
        {"ship_name": "Battleship", "start_row": 0, "start_col": 0, "direction": "vertical"},
        {"ship_name": "Cruiser", "start_row": 4, "start_col": 0, "direction": "horizontal"},
        {"ship_name": "submarine", "start_row": 6, "start_col": 0, "direction": "horizontal"},
        {"ship_name": "Destroyer", "start_row": 8, "start_col": 0, "direction": "horizontal"},
        {"ship_name": "patrol_boat", "start_row": 9, "start_col": 3, "direction": "horizontal"},
    ]

    result = deterministic_board.place_ships_custom(overlapping_custom_ships)
    assert result["success"] is False
    assert "ไม่สามารถวางเรือ" in result["message"]
