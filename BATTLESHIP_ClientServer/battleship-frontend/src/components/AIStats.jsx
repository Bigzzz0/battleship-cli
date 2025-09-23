import React, { useState, useEffect } from 'react';

const AIStats = ({ gameId, hasAI, aiDifficulty }) => {
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAIStats = async () => {
    if (!gameId || !hasAI) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/games/${gameId}/ai-stats`);
      if (response.ok) {
        const data = await response.json();
        setAiStats(data);
      }
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (hasAI && gameId) {
      fetchAIStats();
      // Auto-refresh every 5 seconds during active game
      interval = setInterval(fetchAIStats, 5000);
    } else {
      setAiStats(null); // Clear AI stats if AI is not enabled or gameId is missing
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameId, hasAI]);

  if (!hasAI || !aiStats) {
    return null;
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      case 'expert': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      case 'expert': return '🟣';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">🤖 AI Statistics</h3>
        <button
          onClick={fetchAIStats}
          disabled={loading}
          className="text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-2 py-1 rounded transition-colors"
        >
          {loading ? '⟳' : '🔄'}
        </button>
      </div>

      <div className="space-y-3">
        {/* AI Difficulty */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Difficulty:</span>
          <span className={`font-semibold ${getDifficultyColor(aiStats.difficulty)}`}>
            {getDifficultyIcon(aiStats.difficulty)} {aiStats.difficulty.charAt(0).toUpperCase() + aiStats.difficulty.slice(1)}
          </span>
        </div>

        {/* Total Shots */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Shots:</span>
          <span className="font-semibold text-blue-600">{aiStats.total_shots}</span>
        </div>

        {/* Hits */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Hits:</span>
          <span className="font-semibold text-red-600">{aiStats.hits}</span>
        </div>

        {/* Hit Rate */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Hit Rate:</span>
          <span className="font-semibold text-green-600">
            {aiStats.hit_rate.toFixed(1)}%
          </span>
        </div>

        {/* Current Targets */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Targets Queued:</span>
          <span className="font-semibold text-orange-600">{aiStats.current_targets}</span>
        </div>

        {/* Hunt Mode */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Hunt Mode:</span>
          <span className={`font-semibold ${aiStats.hunt_mode ? 'text-red-600' : 'text-gray-400'}`}>
            {aiStats.hunt_mode ? '🎯 Active' : '🔍 Searching'}
          </span>
        </div>

        {/* Strategy Description */}
        {aiStats.strategy_description && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Strategy:</span>
            <span className="font-semibold text-purple-600 text-sm">
              {aiStats.strategy_description}
            </span>
          </div>
        )}

        {/* Hit Sequence */}
        {aiStats.hit_sequence_length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Hit Streak:</span>
            <span className="font-semibold text-orange-600">
              {aiStats.hit_sequence_length} consecutive
            </span>
          </div>
        )}
      </div>

      {/* Predicted Moves (Expert Mode Only) */}
      {aiStats.predicted_moves && aiStats.predicted_moves.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">🔮 Predicted Next Moves:</h4>
          <div className="flex flex-wrap gap-1">
            {aiStats.predicted_moves.map((move, index) => (
              <span 
                key={index}
                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
              >
                {String.fromCharCode(65 + move[1])}{move[0] + 1}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Performance Indicator */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Performance:</span>
          <div className="flex items-center space-x-1">
            {aiStats.hit_rate >= 50 && <span>🔥</span>}
            {aiStats.hit_rate >= 30 && <span>⚡</span>}
            {aiStats.hit_rate >= 20 && <span>🎯</span>}
            {aiStats.hit_rate < 20 && <span>🤔</span>}
            <span className={`font-medium ${
              aiStats.hit_rate >= 50 ? 'text-red-600' :
              aiStats.hit_rate >= 30 ? 'text-orange-600' :
              aiStats.hit_rate >= 20 ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {aiStats.hit_rate >= 50 ? 'Excellent' :
               aiStats.hit_rate >= 30 ? 'Good' :
               aiStats.hit_rate >= 20 ? 'Average' : 'Learning'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStats;

