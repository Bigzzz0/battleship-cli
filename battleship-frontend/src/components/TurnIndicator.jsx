import React from 'react';

const TurnIndicator = ({ currentTurn, gameStatus, hasAI }) => {
  if (!hasAI || gameStatus !== 'active') {
    return null;
  }

  const isPlayerTurn = currentTurn === 'player';
  const isAiTurn = currentTurn === 'ai';

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Player Turn Indicator */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            isPlayerTurn 
              ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              isPlayerTurn ? 'bg-white animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="font-semibold">👤 Your Turn</span>
          </div>

          {/* VS Divider */}
          <div className="text-gray-400 font-bold text-lg">VS</div>

          {/* AI Turn Indicator */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            isAiTurn 
              ? 'bg-red-500 text-white shadow-lg transform scale-105' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              isAiTurn ? 'bg-white animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="font-semibold">🤖 AI Turn</span>
          </div>
        </div>

        {/* Turn Description */}
        <div className="mt-3 text-center text-sm">
          {isPlayerTurn && (
            <p className="text-blue-600 font-medium">
              🎯 Click on AI's board to attack!
            </p>
          )}
          {isAiTurn && (
            <p className="text-red-600 font-medium">
              🤖 AI is thinking and preparing to attack...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurnIndicator;

