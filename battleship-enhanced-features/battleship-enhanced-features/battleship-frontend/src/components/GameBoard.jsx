import React from 'react';

const GameBoard = ({
  boardState,
  onCellClick = () => {},
  debugMode = false,
  shipsPosition = {},
  disabled = false,
}) => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getCellClass = (row, col) => {
    const cellValue = boardState[row][col];
    const baseClass = `w-8 h-8 border border-gray-400 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors duration-200 flex items-center justify-center text-sm font-bold`;

    if (cellValue === 'H') {
      return `${baseClass} bg-red-500 text-white${disabled ? '' : ' hover:bg-red-600'}`;
    } else if (cellValue === 'M') {
      return `${baseClass} bg-blue-300 text-blue-800${disabled ? '' : ' hover:bg-blue-400'}`;
    } else if (debugMode && isShipPosition(row, col)) {
      return `${baseClass} bg-yellow-200${disabled ? '' : ' hover:bg-yellow-300'}`;
    } else {
      return `${baseClass} bg-gray-100${disabled ? '' : ' hover:bg-gray-200'}`;
    }
  };

  const isShipPosition = (row, col) => {
    if (!shipsPosition || Object.keys(shipsPosition).length === 0) return false;
    
    for (const positions of Object.values(shipsPosition)) {
      if (positions.some(pos => pos[0] === row && pos[1] === col)) {
        return true;
      }
    }
    return false;
  };

  const getCellContent = (row, col) => {
    const cellValue = boardState[row][col];
    if (cellValue === 'H') return '💥';
    if (cellValue === 'M') return '💧';
    if (debugMode && isShipPosition(row, col)) return '🚢';
    return '';
  };

  return (
    <div className="inline-block bg-white p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-11 gap-1">
        {/* Empty corner cell */}
        <div className="w-8 h-8"></div>
        
        {/* Column headers */}
        {columns.map(col => (
          <div key={col} className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">
            {col}
          </div>
        ))}
        
        {/* Rows with row headers and cells */}
        {rows.map(rowNum => (
          <React.Fragment key={rowNum}>
            {/* Row header */}
            <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">
              {rowNum}
            </div>
            
            {/* Row cells */}
            {columns.map((col, colIndex) => {
              const rowIndex = rowNum - 1;
              return (
                <button
                  key={`${col}${rowNum}`}
                  className={getCellClass(rowIndex, colIndex)}
                  onClick={() => {
                    if (disabled) return;
                    onCellClick(rowIndex, colIndex);
                  }}
                  disabled={
                    disabled ||
                    boardState[rowIndex][colIndex] === 'H' ||
                    boardState[rowIndex][colIndex] === 'M'
                  }
                >
                  {getCellContent(rowIndex, colIndex)}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;

