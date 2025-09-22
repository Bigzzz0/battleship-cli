import React, { useState, useEffect } from 'react';
import DualGameBoard from './components/DualGameBoard';
import GameStatusDisplay from './components/GameStatusDisplay';
import AIDifficultySelector from './components/AIDifficultySelector';
import GameStats from './components/GameStats';
import GameHistory from './components/GameHistory';
import ShipPlacement from './components/ShipPlacement';
import AIStats from './components/AIStats';
import TurnIndicator from './components/TurnIndicator';
import useSoundEffects from './hooks/useSoundEffects';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
  // Game state
  const [gameId, setGameId] = useState(null);
  const [playerBoard, setPlayerBoard] = useState(null);
  const [aiBoard, setAiBoard] = useState(null);
  const [gameStatus, setGameStatus] = useState('inactive');
  const [currentTurn, setCurrentTurn] = useState('player');
  
  // AI settings
  const [aiEnabled, setAiEnabled] = useState(true); // Always enable AI - no single player mode
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  
  // Ship placement
  const [showShipPlacement, setShowShipPlacement] = useState(false);
  const [customShips, setCustomShips] = useState(null);
  
  // UI state
  const [debugMode, setDebugMode] = useState(false);
  const [playerDebugBoard, setPlayerDebugBoard] = useState(null);
  const [aiDebugBoard, setAiDebugBoard] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [playerShipsRemaining, setPlayerShipsRemaining] = useState([]);
  const [aiShipsRemaining, setAiShipsRemaining] = useState([]);
  const [message, setMessage] = useState('');
  
  // Sound effects
  const { playSound, soundEnabled, setSoundEnabled } = useSoundEffects();

  // Create new game
  const createNewGame = async (useCustomShips = false, shipsOverride = null) => {
    try {
      // สำหรับเกมกับ AI - บังคับให้ใช้ Custom Ship Placement
      if (aiEnabled && !useCustomShips && !customShips) {
        setShowShipPlacement(true);
        setMessage('Please place your ships before starting the game with AI!');
        return;
      }

      setMessage('Creating new game...');
      playSound('newGame');

      const shipsToUse = useCustomShips ? (shipsOverride || customShips) : null;

      if (useCustomShips && !shipsToUse) {
        setMessage('Please place your ships before starting the game with AI!');
        return;
      }

      const requestBody = {
        with_ai: aiEnabled,
        ai_difficulty: aiDifficulty,
        custom_ships: shipsToUse
      };

      const response = await fetch(`${API_BASE}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setGameId(data.game_id);
      setPlayerBoard(data.player_board_state);
      setAiBoard(data.ai_board_state);
      setGameStatus(data.game_status);
      setCurrentTurn(data.current_turn);
      setMessage(aiEnabled ? 'Game started! Your turn to attack!' : 'Game started! Find all the ships!');

      setPlayerDebugBoard(data.player_ships_positions || null);
      setAiDebugBoard(debugMode ? (data.ai_ships_positions || null) : null);

      // ปิด Ship Placement modal หลังจากสร้างเกมสำเร็จ
      setShowShipPlacement(false);

      // Fetch initial game state for ships remaining
      fetchGameState(data.game_id);
      
    } catch (error) {
      console.error('Error creating game:', error);
      setMessage('Error creating game. Please try again.');
    }
  };

  // Fetch game state
  const fetchGameState = async (currentGameId = gameId) => {
    if (!currentGameId) return;

    try {
      const endpoint = `${API_BASE}/games/${currentGameId}?debug_mode=${debugMode}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch game state');
      
      const data = await response.json();
      
      setPlayerBoard(data.player_board_state);
      setAiBoard(data.ai_board_state);
      setPlayerShipsRemaining(data.player_ships_remaining || []);
      setAiShipsRemaining(data.ai_ships_remaining || []);
      setGameStatus(data.game_status);
      setCurrentTurn(data.current_turn);

      // ตั้งค่า debug boards
      setPlayerDebugBoard(data.player_ships_positions || null);
      setAiDebugBoard(debugMode ? (data.ai_ships_positions || null) : null);
      
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  };

  // Player shoots at AI's board
  const fireShot = async (row, col) => {
    if (!gameId || currentTurn !== 'player' || gameStatus !== 'active') {
      return;
    }

    try {
      const position = `${String.fromCharCode(65 + col)}${row + 1}`;
      
      const response = await fetch(`${API_BASE}/games/${gameId}/fire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update game state
      setAiBoard(result.board_state);
      setAiShipsRemaining(result.ships_remaining || []);
      setGameStatus(result.game_status);
      setCurrentTurn(result.current_turn);
      
      // Play sound effects
      if (result.status === 'hit') {
        if (result.ship_sunk) {
          playSound('shipSunk');
          setMessage(`🎯 Hit! Enemy ship sunk at ${position}!`);
        } else {
          playSound('hit');
          setMessage(`🎯 Hit at ${position}!`);
        }
      } else {
        playSound('miss');
        setMessage(`💧 Miss at ${position}`);
      }
      
      // Check for game end
      if (result.game_status === 'player_won') {
        playSound('win');
        setMessage('🎉 Congratulations! You won!');
      } else if (aiEnabled && result.current_turn === 'ai') {
        // AI's turn - automatically trigger AI shot after a short delay
        setTimeout(() => {
          aiTakeShot();
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error firing shot:', error);
      setMessage('Error firing shot. Please try again.');
    }
  };

  // AI takes a shot
  const aiTakeShot = async () => {
    if (!gameId || !aiEnabled) return;

    try {
      const response = await fetch(`${API_BASE}/games/${gameId}/ai-shot`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update game state
      setPlayerBoard(result.board_state);
      setPlayerShipsRemaining(result.ships_remaining || []);
      setGameStatus(result.game_status);
      setCurrentTurn(result.current_turn);
      
      // Play sound effects and show message
      playSound('aiShot');
      
      if (result.status === 'hit') {
        if (result.ship_sunk) {
          playSound('shipSunk');
          setMessage(`💥 AI hit and sunk your ship at ${result.position}!`);
        } else {
          playSound('hit');
          setMessage(`💥 AI hit your ship at ${result.position}!`);
        }
      } else {
        playSound('miss');
        setMessage(`🌊 AI missed at ${result.position}`);
      }
      
      // Check for game end
      if (result.game_status === 'ai_won') {
        playSound('lose');
        setMessage('💥 Game Over! AI won!');
      } else if (result.current_turn === 'player') {
        setTimeout(() => {
          setMessage('🎯 Your turn! Click on AI\'s board to attack!');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error with AI shot:', error);
      setMessage('Error with AI shot.');
    }
  };

  // Fetch game history
  const fetchGameHistory = async () => {
    if (!gameId) return;

    try {
      const response = await fetch(`${API_BASE}/games/${gameId}/history`);
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      setGameHistory(data.shots || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Handle ship placement completion
  const handleShipsPlaced = (ships) => {
    setCustomShips(ships);
    setShowShipPlacement(false);
    createNewGame(true, ships);
  };

  // Toggle debug mode
  useEffect(() => {
    if (gameId) {
      fetchGameState();
    }
  }, [debugMode]);

  // Auto-fetch history when game changes
  useEffect(() => {
    if (gameId && showHistory) {
      fetchGameHistory();
    }
  }, [gameId, showHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ⚓ Battleship Game
          </h1>
          <p className="text-gray-600">
            {aiEnabled ? 'Battle against AI with two boards!' : 'Find and sink all the ships!'}
          </p>
        </div>

        {/* Game Status */}
        {gameId && (
          <div className="mb-6">
            <GameStatusDisplay
              gameStatus={gameStatus}
              currentTurn={currentTurn}
              playerShipsRemaining={playerShipsRemaining}
              aiShipsRemaining={aiShipsRemaining}
              hasAI={aiEnabled}
              aiDifficulty={aiDifficulty}
            />
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="mb-4 p-3 bg-white border-l-4 border-blue-500 rounded shadow">
            <p className="text-gray-800">{message}</p>
          </div>
        )}

        {/* Game Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* AI Settings */}
          <div>
            <AIDifficultySelector
              aiEnabled={aiEnabled}
              setAiEnabled={setAiEnabled}
              aiDifficulty={aiDifficulty}
              setAiDifficulty={setAiDifficulty}
              disabled={gameStatus === 'active'}
            />
          </div>

          {/* Game Controls */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Game Controls</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => createNewGame(false)}
                disabled={gameStatus === 'active'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                🎮 New Game (Random Ships)
              </button>
              
              <button
                onClick={() => setShowShipPlacement(true)}
                disabled={gameStatus === 'active' || !aiEnabled}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
                title={!aiEnabled ? "Custom Ship Placement is only available when playing with AI" : ""}
              >
                🎯 Custom Ship Placement
                {!aiEnabled && <span className="text-xs block">(AI games only)</span>}
              </button>
            </div>

            {/* Debug and Sound Controls */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-700">🔍 Debug Mode</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-700">🔊 Sound Effects</span>
              </label>
            </div>
          </div>

          {/* Game Stats */}
          <div>
            <GameStats
              gameId={gameId}
              playerShipsRemaining={playerShipsRemaining}
              aiShipsRemaining={aiShipsRemaining}
              hasAI={aiEnabled}
            />
          </div>

          {/* AI Stats */}
          <div>
            <AIStats
              gameId={gameId}
              hasAI={aiEnabled}
              aiDifficulty={aiDifficulty}
            />
          </div>
        </div>

        {/* Turn Indicator */}
        <TurnIndicator
          currentTurn={currentTurn}
          gameStatus={gameStatus}
          hasAI={aiEnabled}
        />

        {/* Game Board */}
        {gameId && playerBoard && (
          <div className="mb-6">
            <DualGameBoard
              playerBoard={playerBoard}
              aiBoard={aiBoard}
              onPlayerShot={fireShot}
              currentTurn={currentTurn}
              gameStatus={gameStatus}
              debugMode={debugMode}
              playerDebugBoard={playerDebugBoard}
              aiDebugBoard={aiDebugBoard}
            />
          </div>
        )}

        {/* Game History */}
        {gameId && (
          <div className="mb-6">
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) fetchGameHistory();
              }}
              className="mb-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {showHistory ? '📖 Hide History' : '📖 Show History'}
            </button>
            
            {showHistory && (
              <GameHistory
                gameId={gameId}
                history={gameHistory}
                onRefresh={fetchGameHistory}
              />
            )}
          </div>
        )}

        {/* Ship Placement Modal */}
        {showShipPlacement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <ShipPlacement
                onShipsPlaced={handleShipsPlaced}
                onCancel={() => setShowShipPlacement(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

