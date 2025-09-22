import React from 'react';

const AIDifficultySelector = ({ 
  aiEnabled, 
  setAiEnabled, 
  aiDifficulty, 
  setAiDifficulty,
  disabled = false 
}) => {
  const difficulties = [
    { 
      value: 'easy', 
      label: 'Easy', 
      description: 'Random shots only',
      color: 'text-green-600'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      description: 'Random shots with target tracking',
      color: 'text-yellow-600'
    },
    { 
      value: 'hard', 
      label: 'Hard', 
      description: 'Strategic hunting with checkerboard pattern',
      color: 'text-red-600'
    },
    { 
      value: 'expert', 
      label: 'Expert', 
      description: 'Advanced probability analysis and pattern recognition',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-gray-800">AI Opponent Settings</h3>
      
      {/* AI Difficulty Selection - Always enabled */}
      <div className="mt-2">
        <h4 className="text-md font-semibold mb-3 text-gray-700">
          Choose AI Difficulty:
        </h4>

        <div className="space-y-3">
          {difficulties.map((difficulty) => (
            <label key={difficulty.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="aiDifficulty"
                value={difficulty.value}
                checked={aiDifficulty === difficulty.value}
                onChange={(e) => setAiDifficulty(e.target.value)}
                disabled={disabled}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
              />
              <div className="flex-1">
                <div className={`font-medium ${difficulty.color}`}>
                  {difficulty.label}
                </div>
                <div className="text-sm text-gray-500">
                  {difficulty.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Info Box - Always show */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 text-lg">ℹ️</div>
          <div className="text-sm text-blue-800">
            <strong>Two-Board Mode:</strong> You'll attack the AI's board while defending your own.
            Take turns shooting until all ships on one side are destroyed!
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDifficultySelector;

