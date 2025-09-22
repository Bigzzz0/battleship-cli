import React from 'react';

const GameStats = ({
  totalShots,
  hits,
  opponentShipsRemaining = [],
  playerShipsRemaining = [],
  hasAI = false,
  gameWon = false,
  winner = null,
  currentTurn = 'player',
  aiDifficulty = 'medium',
}) => {
  const hitRate = totalShots > 0 ? ((hits / totalShots) * 100).toFixed(1) : 0;
  const opponentCount = Array.isArray(opponentShipsRemaining)
    ? opponentShipsRemaining.length
    : Number(opponentShipsRemaining) || 0;
  const playerCount = Array.isArray(playerShipsRemaining)
    ? playerShipsRemaining.length
    : Number(playerShipsRemaining) || 0;

  const renderShipList = (ships) => {
    if (!Array.isArray(ships) || ships.length === 0) {
      return <span className="text-gray-500">None</span>;
    }

    return (
      <span className="text-xs text-gray-600">
        {ships.map((ship, index) => (
          <span key={ship}>
            {ship}
            {index < ships.length - 1 ? ', ' : ''}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Game Statistics</h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Shots:</span>
          <span className="font-semibold">{totalShots}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Hits:</span>
          <span className="font-semibold text-green-600">{hits}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Misses:</span>
          <span className="font-semibold text-red-600">{totalShots - hits}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Hit Rate:</span>
          <span className="font-semibold text-blue-600">{hitRate}%</span>
        </div>
        
        {!hasAI && (
          <div className="flex justify-between">
            <span className="text-gray-600">Ships Remaining:</span>
            <span className="font-semibold">{opponentCount}</span>
          </div>
        )}

        {hasAI && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Turn:</span>
              <span className="font-semibold capitalize">{currentTurn}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">AI Difficulty:</span>
              <span className="font-semibold capitalize">{aiDifficulty}</span>
            </div>

            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">AI Ships Remaining:</span>
                <span className="font-semibold">{opponentCount}</span>
              </div>
              <div>{renderShipList(opponentShipsRemaining)}</div>
            </div>

            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Ships Remaining:</span>
                <span className="font-semibold">{playerCount}</span>
              </div>
              <div>{renderShipList(playerShipsRemaining)}</div>
            </div>
          </>
        )}

        {(gameWon || winner === 'player') && (
          <div className="mt-3 p-2 bg-green-100 rounded text-center">
            <span className="text-green-800 font-bold">🎉 Victory! 🎉</span>
          </div>
        )}

        {winner === 'ai' && (
          <div className="mt-3 p-2 bg-red-100 rounded text-center">
            <span className="text-red-700 font-bold">💀 Defeat! AI wins. 💀</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;

