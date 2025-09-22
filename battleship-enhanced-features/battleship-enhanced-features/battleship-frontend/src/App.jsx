import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import GameBoard from './components/GameBoard.jsx';
import GameStats from './components/GameStats.jsx';
import ShipPlacement from './components/ShipPlacement.jsx';
import GameHistory from './components/GameHistory.jsx';
import useSoundEffects from './hooks/useSoundEffects.js';
import './App.css';

const createEmptyBoard = () => Array.from({ length: 10 }, () => Array(10).fill('O'));

function App() {
  const [gameId, setGameId] = useState(null);
  const [boardState, setBoardState] = useState(createEmptyBoard);
  const [playerBoardState, setPlayerBoardState] = useState(createEmptyBoard);
  const [gameMessage, setGameMessage] = useState('Click "New Game" to start playing!');
  const [debugMode, setDebugMode] = useState(false);
  const [shipsPosition, setShipsPosition] = useState({});
  const [playerShipsPosition, setPlayerShipsPosition] = useState({});
  const [totalShots, setTotalShots] = useState(0);
  const [hits, setHits] = useState(0);
  const [opponentShipsRemaining, setOpponentShipsRemaining] = useState([]);
  const [playerShipsRemaining, setPlayerShipsRemaining] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showShipPlacement, setShowShipPlacement] = useState(false);
  const [customShips, setCustomShips] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [hasAI, setHasAI] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('player');
  const [winner, setWinner] = useState(null);
  const [aiDifficulty, setAiDifficulty] = useState('medium');

  const API_BASE_URL = 'http://localhost:8000';
  
  // Sound Effects Hook
  const {
    playHitSound,
    playMissSound,
    playWinSound,
    playLoseSound,
    playNewGameSound,
    playShipSunkSound,
    playAIShotSound,
    toggleSound,
    isSoundEnabled
  } = useSoundEffects();

  const [soundEnabled, setSoundEnabled] = useState(true);

  const createNewGame = async (useCustomShips = false, withAI = false) => {
    setLoading(true);
    try {
      const requestBody = {
        with_ai: withAI,
        difficulty: aiDifficulty,
        custom_ships: useCustomShips ? customShips : null
      };

      const response = await fetch(`${API_BASE_URL}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const data = await response.json();
        setGameId(data.game_id);
        setHasAI(data.has_ai || false);
        setGameMessage(data.has_ai
          ? 'AI battle started! Target the enemy board to begin.'
          : 'Game started! Click on the grid to fire shots.');
        setTotalShots(0);
        setHits(0);
        setGameWon(false);
        setWinner(data.winner || null);
        setCurrentTurn(data.current_turn || 'player');
        setShipsPosition({});
        setPlayerShipsPosition({});

        if (data.has_ai) {
          setBoardState(data.ai_board_state || createEmptyBoard());
          setPlayerBoardState(data.player_board_state || createEmptyBoard());
          setOpponentShipsRemaining(data.ai_ships_remaining || []);
          setPlayerShipsRemaining(data.player_ships_remaining || []);
        } else {
          setBoardState(data.board_state || createEmptyBoard());
          setPlayerBoardState(createEmptyBoard());
          setOpponentShipsRemaining(data.ships_remaining || []);
          setPlayerShipsRemaining([]);
        }

        // เล่นเสียงเกมใหม่
        if (soundEnabled) {
          playNewGameSound();
        }

        // Get game state to get ships remaining count
        await getGameState(data.game_id);
      } else {
        const errorData = await response.json();
        setGameMessage(`Failed to create new game: ${errorData.detail || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error creating new game:', error);
      setGameMessage('Error connecting to server. Please check if the backend is running.');
    }
    setLoading(false);
  };

  const aiTakeShot = async () => {
    if (!gameId || !hasAI || gameWon || winner === 'ai') return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/ai-shot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.status === 'error') {
          setGameMessage(data.message || 'AI shot failed.');
          setCurrentTurn(data.current_turn || currentTurn);
          setWinner(data.winner || winner);
          return;
        }

        const shot = data.ai_shot;

        if (shot) {
          setBoardState(data.ai_board_state || boardState);
          setPlayerBoardState(data.player_board_state || playerBoardState);
          setOpponentShipsRemaining(data.ai_ships_remaining || []);
          setPlayerShipsRemaining(data.player_ships_remaining || []);
          setCurrentTurn(data.current_turn || 'player');
          setWinner(data.winner || null);
          setGameWon((data.winner || null) === 'player');

          setGameMessage(`AI shot at ${shot.position}: ${shot.message}`);

          if (soundEnabled) {
            playAIShotSound();

            setTimeout(() => {
              if (shot.status === 'hit') {
                playHitSound();
                if (shot.ship_sunk) {
                  setTimeout(() => playShipSunkSound(), 300);
                }
              } else if (shot.status === 'miss') {
                playMissSound();
              }
            }, 200);
          }

          if (data.winner === 'ai') {
            setGameMessage('💀 AI wins! All your ships have been sunk! 💀');
            if (soundEnabled) {
              setTimeout(() => playLoseSound(), 500);
            }
          }
        } else {
          setGameMessage('AI shot failed. Please try again.');
        }
      } else {
        setGameMessage('AI shot failed. Please try again.');
      }
    } catch (error) {
      console.error('Error with AI shot:', error);
      setGameMessage('Error with AI shot.');
    } finally {
      setLoading(false);
    }
  };

  const getGameState = async (currentGameId) => {
    try {
      const endpoint = debugMode ? `/games/${currentGameId}/debug` : `/games/${currentGameId}`;
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        if (data.has_ai) {
          setHasAI(true);
          setBoardState(data.ai_board_state || createEmptyBoard());
          setPlayerBoardState(data.player_board_state || createEmptyBoard());
          setOpponentShipsRemaining(data.ai_ships_remaining || []);
          setPlayerShipsRemaining(data.player_ships_remaining || []);
          setCurrentTurn(data.current_turn || 'player');
          setWinner(data.winner || null);
          const aiShipsSunk = data.all_ships_sunk && typeof data.all_ships_sunk === 'object'
            ? data.all_ships_sunk.ai
            : false;
          setGameWon(data.winner === 'player' || aiShipsSunk);

          if (debugMode) {
            setShipsPosition(data.ai_ships_position || {});
            setPlayerShipsPosition(data.player_ships_position || {});
          } else {
            setShipsPosition({});
            setPlayerShipsPosition({});
          }
        } else {
          setHasAI(false);
          setBoardState(data.board_state || createEmptyBoard());
          setPlayerBoardState(createEmptyBoard());
          setOpponentShipsRemaining(data.ships_remaining || []);
          setPlayerShipsRemaining([]);
          setCurrentTurn('player');
          setWinner(data.all_ships_sunk ? 'player' : null);
          setGameWon(!!data.all_ships_sunk);

          if (debugMode && data.ships_position) {
            setShipsPosition(data.ships_position);
          } else {
            setShipsPosition({});
          }

          setPlayerShipsPosition({});
        }
      }
    } catch (error) {
      console.error('Error getting game state:', error);
    }
  };

  const fireShot = async (row, col) => {
    if (!gameId || gameWon || winner === 'ai') return;
    if (hasAI && currentTurn !== 'player') {
      setGameMessage("It's not your turn yet. Wait for the AI to finish.");
      return;
    }

    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const position = `${columns[col]}${row + 1}`;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/fire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.has_ai) {
          const shot = data.player_shot;

          setBoardState(data.ai_board_state || boardState);
          setPlayerBoardState(data.player_board_state || playerBoardState);
          setOpponentShipsRemaining(data.ai_ships_remaining || []);
          setPlayerShipsRemaining(data.player_ships_remaining || []);
          setCurrentTurn(data.current_turn || 'player');
          setWinner(data.winner || null);
          setGameWon((data.winner || null) === 'player');

          if (shot) {
            setGameMessage(`You fired at ${shot.position}: ${shot.message}`);

            if (shot.status !== 'already_shot' && shot.status !== 'error') {
              setTotalShots(prev => prev + 1);

              if (shot.status === 'hit') {
                setHits(prev => prev + 1);
                if (soundEnabled) {
                  playHitSound();
                  if (shot.ship_sunk) {
                    setTimeout(() => playShipSunkSound(), 300);
                  }
                }
              } else if (shot.status === 'miss') {
                if (soundEnabled) {
                  playMissSound();
                }
              }
            }

            if (data.winner === 'player') {
              setGameMessage('🎉 Congratulations! You sunk all AI ships! 🎉');
              if (soundEnabled) {
                setTimeout(() => playWinSound(), 500);
              }
            }
          } else {
            setGameMessage('Failed to process your shot. Please try again.');
          }
        } else {
          setBoardState(data.board_state || boardState);
          setOpponentShipsRemaining(data.ships_remaining || []);
          setGameWon(data.all_ships_sunk);

          setGameMessage(data.message);

          if (data.status !== 'already_shot' && data.status !== 'error') {
            setTotalShots(prev => prev + 1);
            if (data.status === 'hit') {
              setHits(prev => prev + 1);

              if (soundEnabled) {
                playHitSound();
                if (data.message.includes('sunk')) {
                  setTimeout(() => playShipSunkSound(), 300);
                }
              }
            } else if (data.status === 'miss') {
              if (soundEnabled) {
                playMissSound();
              }
            }
          }

          if (data.all_ships_sunk) {
            setGameMessage('🎉 Congratulations! You sunk all ships! 🎉');
            if (soundEnabled) {
              setTimeout(() => playWinSound(), 500);
            }
          }
        }
      } else {
        setGameMessage('Failed to fire shot. Please try again.');
      }
    } catch (error) {
      console.error('Error firing shot:', error);
      setGameMessage('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  const handleSoundToggle = (enabled) => {
    setSoundEnabled(enabled);
    toggleSound(enabled);
  };

  // Update game state when debug mode changes
  useEffect(() => {
    if (gameId) {
      getGameState(gameId);
    }
  }, [debugMode]);

  useEffect(() => {
    if (hasAI && gameId && currentTurn === 'ai' && !winner && !loading) {
      const timeout = setTimeout(() => {
        aiTakeShot();
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [hasAI, gameId, currentTurn, winner, loading]);

  const handleShipsPlaced = (ships) => {
    setCustomShips(ships);
    setShowShipPlacement(false);
    createNewGame(true, aiEnabled);
  };

  const handleCancelShipPlacement = () => {
    setShowShipPlacement(false);
  };

  if (showHistory && gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            🚢 Game History 🚢
          </h1>
          <GameHistory 
            gameId={gameId}
            onClose={() => setShowHistory(false)}
          />
        </div>
      </div>
    );
  }

  if (showShipPlacement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            🚢 Battleship Game - Ship Placement 🚢
          </h1>
          <ShipPlacement 
            onShipsPlaced={handleShipsPlaced}
            onCancel={handleCancelShipPlacement}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🚢 Battleship Game 🚢
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Game Board Section */}
          <div className="flex flex-col items-center gap-4">
            {hasAI ? (
              <div className="flex flex-col xl:flex-row gap-6 items-start">
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Your Fleet</h2>
                  <GameBoard
                    boardState={playerBoardState}
                    debugMode={debugMode}
                    shipsPosition={playerShipsPosition}
                    disabled
                  />
                </div>

                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Enemy Waters</h2>
                  <GameBoard
                    boardState={boardState}
                    onCellClick={fireShot}
                    debugMode={debugMode}
                    shipsPosition={shipsPosition}
                    disabled={loading || currentTurn !== 'player' || winner === 'ai' || gameWon}
                  />
                  <p className="mt-3 text-sm text-gray-600 text-center">
                    {winner
                      ? winner === 'player'
                        ? 'You defeated the AI! Start a new game to play again.'
                        : 'The AI has won. Start a new game to reclaim the seas.'
                      : currentTurn === 'player'
                        ? 'Select a target on the AI board to fire your shot.'
                        : 'Waiting for the AI to take its turn...'}
                  </p>
                </div>
              </div>
            ) : (
              <GameBoard
                boardState={boardState}
                onCellClick={fireShot}
                debugMode={debugMode}
                shipsPosition={shipsPosition}
                disabled={loading || gameWon}
              />
            )}

            {/* Game Message */}
            <div className="p-3 bg-white rounded-lg shadow-md max-w-xl text-center">
              <p className="text-gray-700">{gameMessage}</p>
            </div>
          </div>

          {/* Controls and Stats */}
          <div className="flex flex-col gap-4">
            {/* Game Controls */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-3 text-gray-800">Game Controls</h3>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => createNewGame(false, aiEnabled)} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Loading...' : 'New Game (Random Ships)'}
                </Button>
                
                <Button
                  onClick={() => setShowShipPlacement(true)}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Custom Ship Placement
                </Button>

                {gameId && (
                  <Button
                    onClick={() => setShowHistory(true)}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    View History 📊
                  </Button>
                )}
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aiEnabled"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="aiEnabled" className="text-sm text-gray-700">
                    Enable AI Opponent
                  </label>
                </div>

                {aiEnabled && (
                  <div className="space-y-1">
                    <label htmlFor="aiDifficulty" className="text-sm text-gray-700">
                      AI Difficulty
                    </label>
                    <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
                      <SelectTrigger id="aiDifficulty" className="w-full justify-between">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="soundEnabled"
                    checked={soundEnabled}
                    onChange={(e) => handleSoundToggle(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="soundEnabled" className="text-sm text-gray-700">
                    Sound Effects 🔊
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="debugMode"
                    checked={debugMode}
                    onChange={toggleDebugMode}
                    className="rounded"
                  />
                  <label htmlFor="debugMode" className="text-sm text-gray-700">
                    Debug Mode (Show Ships)
                  </label>
                </div>
              </div>
            </div>

            {/* Game Statistics */}
            <GameStats
              totalShots={totalShots}
              hits={hits}
              opponentShipsRemaining={opponentShipsRemaining}
              playerShipsRemaining={playerShipsRemaining}
              hasAI={hasAI}
              gameWon={gameWon}
              winner={winner}
              currentTurn={currentTurn}
              aiDifficulty={aiDifficulty}
            />
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 bg-white p-4 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h3 className="text-lg font-bold mb-2 text-gray-800">How to Play</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click "New Game" to start a new battleship game</li>
            <li>• Click on any cell in the grid to fire a shot</li>
            <li>• 💥 Red cells indicate hits, 💧 blue cells indicate misses</li>
            <li>• Enable "AI Opponent" and choose a difficulty to battle against the computer</li>
            <li>• When facing the AI, take turns firing until one fleet is completely sunk</li>
            <li>• Enable "Debug Mode" to see ship positions (for testing)</li>
            <li>• Sink all ships to win the game!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;

