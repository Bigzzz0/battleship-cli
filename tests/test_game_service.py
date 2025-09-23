from copy import deepcopy

from app.services.game_service import GameService


DEFAULT_CUSTOM_SHIPS = [
    {"ship_name": "Carrier", "start_row": 0, "start_col": 0, "direction": "horizontal"},
    {"ship_name": "Battleship", "start_row": 2, "start_col": 0, "direction": "horizontal"},
    {"ship_name": "Cruiser", "start_row": 4, "start_col": 0, "direction": "horizontal"},
    {"ship_name": "submarine", "start_row": 6, "start_col": 0, "direction": "horizontal"},
    {"ship_name": "Destroyer", "start_row": 8, "start_col": 0, "direction": "horizontal"},
    {"ship_name": "patrol_boat", "start_row": 9, "start_col": 3, "direction": "horizontal"},
]


def test_create_new_game_without_ai():
    response = GameService.create_new_game()

    assert "game_id" in response
    assert response["has_ai"] is False
    assert response["current_turn"] == "player"

    stored_game = GameService.games[response["game_id"]]
    assert stored_game["player_board"] is not None
    assert stored_game["ai_board"] is None
    assert stored_game["history"].shots == []


def test_create_new_game_with_ai_and_custom_board():
    response = GameService.create_new_game(with_ai=True, ai_difficulty="expert", custom_ships=deepcopy(DEFAULT_CUSTOM_SHIPS))

    assert response["has_ai"] is True
    assert response["ai_difficulty"] == "expert"
    assert response["current_turn"] == "player"

    stored_game = GameService.games[response["game_id"]]
    assert stored_game["ai_board"] is not None
    assert stored_game["ai_opponent"] is not None
    assert stored_game["ai_difficulty"] == "expert"


def test_take_shot_against_ai_switches_turn_and_records_hit():
    response = GameService.create_new_game(with_ai=True, custom_ships=deepcopy(DEFAULT_CUSTOM_SHIPS))
    game_id = response["game_id"]

    game = GameService.games[game_id]
    placement_result = game["ai_board"].place_ships_custom(deepcopy(DEFAULT_CUSTOM_SHIPS))
    assert placement_result["success"], placement_result

    shot_result = GameService.take_shot(game_id, 0, 0)

    assert shot_result["status"] == "hit"
    assert shot_result["ship_sunk"] is False
    assert shot_result["target_type"] == "ai"
    assert shot_result["current_turn"] == "ai"
    assert game["current_turn"] == "ai"
    assert len(game["history"].shots) == 1


def test_ai_take_shot_requires_player_turn_to_finish_first():
    response = GameService.create_new_game(with_ai=True, custom_ships=deepcopy(DEFAULT_CUSTOM_SHIPS))
    game_id = response["game_id"]

    ai_result = GameService.ai_take_shot(game_id)
    assert ai_result["status"] == "error"
    assert "Not AI turn" in ai_result["message"]


def test_ai_take_shot_after_player_attack():
    response = GameService.create_new_game(with_ai=True, custom_ships=deepcopy(DEFAULT_CUSTOM_SHIPS))
    game_id = response["game_id"]
    game = GameService.games[game_id]

    game["ai_board"].place_ships_custom(deepcopy(DEFAULT_CUSTOM_SHIPS))

    # Player fires first to give AI the turn
    GameService.take_shot(game_id, 0, 0)

    # Force AI to target a known ship cell
    game["ai_opponent"].get_next_shot = lambda board_size=10: (0, 0)

    ai_result = GameService.ai_take_shot(game_id)

    assert ai_result["status"] == "hit"
    assert ai_result["current_turn"] == "player"
    assert game["player_board"].ships_board[0][0] == "H"
    assert len(game["history"].shots) == 2


def test_validate_ship_placement_uses_board_rules():
    result = GameService.validate_ship_placement(deepcopy(DEFAULT_CUSTOM_SHIPS))
    assert result["success"] is True

    invalid = deepcopy(DEFAULT_CUSTOM_SHIPS)
    invalid[0] = {"ship_name": "Carrier", "start_row": 0, "start_col": 8, "direction": "horizontal"}

    invalid_result = GameService.validate_ship_placement(invalid)
    assert invalid_result["success"] is False
