import React from 'react';

const DualGameBoard = ({ 
  playerBoard, 
  aiBoard, 
  onPlayerShot, 
  currentTurn, 
  gameStatus,
  debugMode = false,
  playerDebugBoard = null,
  aiDebugBoard = null
}) => {
  const renderBoard = (board, debugBoard, isPlayerBoard, onCellClick) => {
    if (!board) return null;

    return (
      <div className="grid grid-cols-11 gap-1 text-sm">
        {/* Header row */}
        <div></div>
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(col => (
          <div key={col} className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">
            {col}
          </div>
        ))}
        
        {/* Board rows */}
        {board.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {/* Row number */}
            <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">
              {rowIndex + 1}
            </div>
            
            {/* Board cells */}
            {row.map((cell, colIndex) => {
              const isClickable = !isPlayerBoard && currentTurn === 'player' && gameStatus === 'active';
              const hasShip = debugMode && debugBoard && debugBoard[rowIndex] && debugBoard[rowIndex][colIndex];
              
              let cellClass = "w-8 h-8 border border-gray-400 flex items-center justify-center cursor-pointer transition-colors ";
              let cellContent = "";
              
              // Cell styling based on state
              if (cell === 'H') {
                cellClass += "bg-red-500 text-white font-bold";
                cellContent = "💥";
              } else if (cell === 'M') {
                cellClass += "bg-blue-200 text-blue-800";
                cellContent = "💧";
              } else if (hasShip && debugMode) {
                cellClass += "bg-gray-300 text-gray-700";
                cellContent = "🚢";
              } else {
                cellClass += "bg-gray-100 hover:bg-gray-200";
              }
              
              // Disable clicking if not clickable
              if (!isClickable) {
                cellClass += " cursor-not-allowed";
              }
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cellClass}
                  onClick={() => isClickable && onCellClick && onCellClick(rowIndex, colIndex)}
                  title={`${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`}
                >
                  {cellContent}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      {/* Player's Board */}
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-bold mb-4 text-blue-600">
          Your Board
        </h3>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          {renderBoard(playerBoard, playerDebugBoard, true, null)}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Defend your ships!
        </div>
      </div>

      {/* VS Indicator */}
      {aiBoard && (
        <div className="flex items-center justify-center lg:mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
            VS
          </div>
        </div>
      )}

      {/* AI's Board */}
      {aiBoard && (
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4 text-red-600">
            AI's Board
          </h3>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            {renderBoard(aiBoard, aiDebugBoard, false, onPlayerShot)}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {currentTurn === 'player' && gameStatus === 'active' 
              ? "Click to attack!" 
              : "Wait for your turn..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default DualGameBoard;

