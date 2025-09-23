import os
import random
import sys

import pytest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.services.game_service import GameService


@pytest.fixture(autouse=True)
def reset_game_service_state():
    """Ensure each test starts with a clean in-memory game registry."""
    GameService.games.clear()
    random.seed(0)
    yield
    GameService.games.clear()
