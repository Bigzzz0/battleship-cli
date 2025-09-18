import React from 'react';

const GameStats = ({ totalShots, hits, shipsRemaining, gameWon }) => {
  const hitRate = totalShots > 0 ? ((hits / totalShots) * 100).toFixed(1) : 0;

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
        
        <div className="flex justify-between">
          <span className="text-gray-600">Ships Remaining:</span>
          <span className="font-semibold">{shipsRemaining}</span>
        </div>
        
        {gameWon && (
          <div className="mt-3 p-2 bg-green-100 rounded text-center">
            <span className="text-green-800 font-bold">🎉 Victory! 🎉</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;

