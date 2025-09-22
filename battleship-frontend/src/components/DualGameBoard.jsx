import React from 'react';

const extractShipPositions = (debugBoard) => {
  const positions = new Set();

  if (!debugBoard) {
    return positions;
  }

  if (Array.isArray(debugBoard)) {
    debugBoard.forEach((row, rowIndex) => {
      if (!row) return;
      row.forEach((cell, colIndex) => {
        if (cell) {
          positions.add(`${rowIndex}-${colIndex}`);
        }
      });
    });
    return positions;
  }

  Object.values(debugBoard).forEach((shipCells) => {
    if (!shipCells) return;

    shipCells.forEach((cell) => {
      if (Array.isArray(cell) && cell.length === 2) {
        const [row, col] = cell;
        positions.add(`${row}-${col}`);
      } else if (cell && typeof cell === 'object') {
        if (typeof cell.row === 'number' && typeof cell.col === 'number') {
          positions.add(`${cell.row}-${cell.col}`);
        }
      }
    });
  });

  return positions;
};

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
  const renderBoard = (board, debugBoard, isPlayerBoard, onCellClick, showShips) => {
    if (!board) return null;

    const shipPositions = extractShipPositions(debugBoard);
    const shouldShowShips = showShips && shipPositions.size > 0;

    return (
      <div className="grid grid-cols-11 gap-1 text-sm">
        <div></div>
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((col) => (
          <div key={col} className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">
            {col}
          </div>
        ))}

        {board.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">
              {rowIndex + 1}
            </div>

            {row.map((cell, colIndex) => {
              const isClickable = !isPlayerBoard && currentTurn === 'player' && gameStatus === 'active';
              const cellKey = `${rowIndex}-${colIndex}`;
              const hasShip = shouldShowShips && shipPositions.has(cellKey);

              let cellClass = 'w-8 h-8 border border-gray-400 flex items-center justify-center transition-colors';
              let cellContent = '';

              if (cell === 'H') {
                cellClass += ' bg-red-500 text-white font-bold';
                cellContent = '💥';
              } else if (cell === 'M') {
                cellClass += ' bg-blue-200 text-blue-800';
                cellContent = '💧';
              } else if (hasShip) {
                cellClass += ' bg-gray-300 text-gray-700';
                cellContent = '🚢';
              } else {
                cellClass += ' bg-blue-50 hover:bg-blue-100';
              }

              cellClass += isClickable ? ' cursor-pointer' : ' cursor-not-allowed';

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
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-bold mb-4 text-blue-600">Your Board</h3>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          {renderBoard(playerBoard, playerDebugBoard, true, null, true)}
        </div>
        <div className="mt-2 text-sm text-gray-600">Defend your ships!</div>
      </div>

      {aiBoard && (
        <div className="flex items-center justify-center lg:mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
            VS
          </div>
        </div>
      )}

      {aiBoard && (
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4 text-red-600">AI's Board</h3>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            {renderBoard(aiBoard, aiDebugBoard, false, onPlayerShot, debugMode)}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {currentTurn === 'player' && gameStatus === 'active' ? 'Click to attack!' : 'Wait for your turn...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default DualGameBoard;

