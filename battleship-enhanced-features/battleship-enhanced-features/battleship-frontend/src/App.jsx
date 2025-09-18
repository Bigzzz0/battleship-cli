import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import GameBoard from './components/GameBoard.jsx';
import GameStats from './components/GameStats.jsx';
import ShipPlacement from './components/ShipPlacement.jsx';
import GameHistory from './components/GameHistory.jsx';
import useSoundEffects from './hooks/useSoundEffects.js';
import './App.css';

function App() {
  const [gameId, setGameId] = useState(null);
  const [boardState, setBoardState] = useState(Array(10).fill().map(() => Array(10).fill('O')));
  const [gameMessage, setGameMessage] = useState('Click "New Game" to start playing!');
  const [debugMode, setDebugMode] = useState(false);
  const [shipsPosition, setShipsPosition] = useState({});
  const [totalShots, setTotalShots] = useState(0);
  const [hits, setHits] = useState(0);
  const [shipsRemaining, setShipsRemaining] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showShipPlacement, setShowShipPlacement] = useState(false);
  const [customShips, setCustomShips] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [hasAI, setHasAI] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

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
        setBoardState(data.board_state);
        setGameMessage('Game started! Click on the grid to fire shots.');
        setTotalShots(0);
        setHits(0);
        setShipsRemaining(6); // Default number of ships
        setGameWon(false);
        setHasAI(data.has_ai || false);
        
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
    if (!gameId || !hasAI || gameWon) return;
    
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
        setBoardState(data.board_state);
        setGameMessage(`AI shot at ${data.position}: ${data.message}`);
        setShipsRemaining(data.ships_remaining.length);
        setGameWon(data.all_ships_sunk);
        
        // เล่นเสียง AI ยิง
        if (soundEnabled) {
          playAIShotSound();
          
          // เล่นเสียงตามผลลัพธ์
          setTimeout(() => {
            if (data.status === 'hit') {
              playHitSound();
              if (data.ship_sunk) {
                setTimeout(() => playShipSunkSound(), 300);
              }
            } else if (data.status === 'miss') {
              playMissSound();
            }
          }, 200);
        }
        
        if (data.all_ships_sunk) {
          setGameMessage('💀 AI wins! All your ships have been sunk! 💀');
          if (soundEnabled) {
            setTimeout(() => playLoseSound(), 500);
          }
        }
      } else {
        setGameMessage('AI shot failed. Please try again.');
      }
    } catch (error) {
      console.error('Error with AI shot:', error);
      setGameMessage('Error with AI shot.');
    }
    setLoading(false);
  };

  const getGameState = async (currentGameId) => {
    try {
      const endpoint = debugMode ? `/games/${currentGameId}/debug` : `/games/${currentGameId}`;
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        setBoardState(data.board_state);
        setShipsRemaining(data.ships_remaining.length);
        setGameWon(data.all_ships_sunk);
        
        if (debugMode && data.ships_position) {
          setShipsPosition(data.ships_position);
        } else {
          setShipsPosition({});
        }
      }
    } catch (error) {
      console.error('Error getting game state:', error);
    }
  };

  const fireShot = async (row, col) => {
    if (!gameId || gameWon) return;
    
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
        setBoardState(data.board_state);
        setGameMessage(data.message);
        setShipsRemaining(data.ships_remaining.length);
        setGameWon(data.all_ships_sunk);
        
        if (data.status !== 'already_shot' && data.status !== 'error') {
          setTotalShots(prev => prev + 1);
          if (data.status === 'hit') {
            setHits(prev => prev + 1);
            
            // เล่นเสียงโดนเป้า
            if (soundEnabled) {
              playHitSound();
              if (data.message.includes('sunk')) {
                setTimeout(() => playShipSunkSound(), 300);
              }
            }
          } else if (data.status === 'miss') {
            // เล่นเสียงพลาด
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
      } else {
        setGameMessage('Failed to fire shot. Please try again.');
      }
    } catch (error) {
      console.error('Error firing shot:', error);
      setGameMessage('Error connecting to server.');
    }
    setLoading(false);
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
          {/* Game Board */}
          <div className="flex flex-col items-center">
            <GameBoard
              boardState={boardState}
              onCellClick={fireShot}
              debugMode={debugMode}
              shipsPosition={shipsPosition}
            />
            
            {/* Game Message */}
            <div className="mt-4 p-3 bg-white rounded-lg shadow-md max-w-md text-center">
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
                
                {hasAI && (
                  <Button 
                    onClick={aiTakeShot} 
                    disabled={loading || gameWon}
                    variant="secondary"
                    className="w-full"
                  >
                    AI Take Shot 🤖
                  </Button>
                )}
                
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
              shipsRemaining={shipsRemaining}
              gameWon={gameWon}
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
            <li>• Enable "Debug Mode" to see ship positions (for testing)</li>
            <li>• Sink all ships to win the game!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;

