import React from 'react';

const GameStatusDisplay = ({ 
  gameStatus, 
  currentTurn, 
  playerShipsRemaining, 
  aiShipsRemaining,
  hasAI,
  aiDifficulty 
}) => {
  const getStatusMessage = () => {
    if (gameStatus === 'player_won') {
      return {
        message: "🎉 Congratulations! You Won!",
        className: "text-green-600 bg-green-50 border-green-200"
      };
    } else if (gameStatus === 'ai_won') {
      return {
        message: "💥 Game Over! AI Won!",
        className: "text-red-600 bg-red-50 border-red-200"
      };
    } else if (gameStatus === 'active') {
      if (!hasAI) {
        return {
          message: "🎯 Single Player Mode - Sink all ships!",
          className: "text-blue-600 bg-blue-50 border-blue-200"
        };
      } else if (currentTurn === 'player') {
        return {
          message: "🎯 Your Turn - Click on AI's board to attack!",
          className: "text-blue-600 bg-blue-50 border-blue-200"
        };
      } else if (currentTurn === 'ai') {
        return {
          message: "🤖 AI's Turn - Wait for AI to shoot...",
          className: "text-orange-600 bg-orange-50 border-orange-200"
        };
      }
    }
    
    return {
      message: "🎮 Game Ready",
      className: "text-gray-600 bg-gray-50 border-gray-200"
    };
  };

  const status = getStatusMessage();

  return (
    <div className="space-y-4">
      {/* Main Status Message */}
      <div className={`p-4 rounded-lg border-2 text-center font-bold text-lg ${status.className}`}>
        {status.message}
      </div>

      {/* Game Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Player Ships */}
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <h4 className="font-semibold text-blue-600 mb-2">Your Ships</h4>
          <div className="text-2xl font-bold text-blue-800">
            {playerShipsRemaining ? playerShipsRemaining.length : 0}
          </div>
          <div className="text-sm text-gray-500">ships remaining</div>
        </div>

        {/* AI Ships (if AI enabled) */}
        {hasAI && (
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <h4 className="font-semibold text-red-600 mb-2">AI Ships</h4>
            <div className="text-2xl font-bold text-red-800">
              {aiShipsRemaining ? aiShipsRemaining.length : 0}
            </div>
            <div className="text-sm text-gray-500">ships remaining</div>
          </div>
        )}

        {/* AI Difficulty (if AI enabled) */}
        {hasAI && aiDifficulty && (
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-600 mb-2">AI Difficulty</h4>
            <div className="text-lg font-bold text-purple-800 capitalize">
              {aiDifficulty}
            </div>
            <div className="text-sm text-gray-500">
              {aiDifficulty === 'easy' && 'Random shots'}
              {aiDifficulty === 'medium' && 'Smart targeting'}
              {aiDifficulty === 'hard' && 'Strategic hunting'}
            </div>
          </div>
        )}
      </div>

      {/* Turn Indicator (for AI games) */}
      {hasAI && gameStatus === 'active' && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-4 bg-white p-3 rounded-lg shadow">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              currentTurn === 'player' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium">Player</span>
            </div>
            
            <div className="text-gray-400">vs</div>
            
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              currentTurn === 'ai' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="font-medium">AI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStatusDisplay;

