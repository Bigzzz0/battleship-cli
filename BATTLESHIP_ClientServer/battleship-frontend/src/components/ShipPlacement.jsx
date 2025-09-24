import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { API_BASE_URL } from '@/config';

const ShipPlacement = ({ onShipsPlaced, onCancel }) => {
  const [ships, setShips] = useState({});
  const [placedShips, setPlacedShips] = useState([]);
  const [currentShip, setCurrentShip] = useState(null);
  const [currentDirection, setCurrentDirection] = useState('horizontal');
  const [previewBoard, setPreviewBoard] = useState(Array(10).fill().map(() => Array(10).fill(null)));
  const [hoveredCells, setHoveredCells] = useState([]);

  // ดึงข้อมูลเรือจาก API
  useEffect(() => {
    fetch(`${API_BASE_URL}/ships`)
      .then(res => res.json())
      .then(data => {
        setShips(data);
        // เลือกเรือแรกเป็นค่าเริ่มต้น
        const firstShip = Object.keys(data)[0];
        if (firstShip) {
          setCurrentShip(firstShip);
        }
      })
      .catch(err => console.error('Error fetching ships:', err));
  }, []);

  // อัปเดต preview board เมื่อมีการวางเรือ
  useEffect(() => {
    const newBoard = Array(10).fill().map(() => Array(10).fill(null));
    
    placedShips.forEach((ship, index) => {
      const positions = getShipPositions(ship.start_row, ship.start_col, ships[ship.ship_name], ship.direction);
      positions.forEach(([row, col]) => {
        if (row >= 0 && row < 10 && col >= 0 && col < 10) {
          newBoard[row][col] = { ship: ship.ship_name, index };
        }
      });
    });

    setPreviewBoard(newBoard);
  }, [placedShips, ships]);

  const getShipPositions = (startRow, startCol, size, direction) => {
    const positions = [];
    for (let i = 0; i < size; i++) {
      if (direction === 'horizontal') {
        positions.push([startRow, startCol + i]);
      } else {
        positions.push([startRow + i, startCol]);
      }
    }
    return positions;
  };

  const canPlaceShip = (startRow, startCol, size, direction) => {
    const positions = getShipPositions(startRow, startCol, size, direction);
    
    // ตรวจสอบว่าอยู่ในขอบเขต
    for (const [row, col] of positions) {
      if (row < 0 || row >= 10 || col < 0 || col >= 10) {
        return false;
      }
    }

    // ตรวจสอบว่าไม่ทับกับเรือที่วางแล้ว
    for (const [row, col] of positions) {
      if (previewBoard[row][col] !== null) {
        return false;
      }
    }

    return true;
  };

  const handleCellClick = (row, col) => {
    if (!currentShip || !ships[currentShip]) return;

    const size = ships[currentShip];
    
    if (canPlaceShip(row, col, size, currentDirection)) {
      const newShip = {
        ship_name: currentShip,
        start_row: row,
        start_col: col,
        direction: currentDirection
      };

      setPlacedShips([...placedShips, newShip]);

      // เลือกเรือถัดไป
      const remainingShips = Object.keys(ships).filter(
        shipName => !placedShips.some(placed => placed.ship_name === shipName) && shipName !== currentShip
      );
      
      if (remainingShips.length > 0) {
        setCurrentShip(remainingShips[0]);
      } else {
        setCurrentShip(null);
      }
    }
  };

  const handleCellHover = (row, col) => {
    if (!currentShip || !ships[currentShip]) {
      setHoveredCells([]);
      return;
    }

    const size = ships[currentShip];
    const positions = getShipPositions(row, col, size, currentDirection);
    const validPlacement = canPlaceShip(row, col, size, currentDirection);

    setHoveredCells(positions.map(([r, c]) => ({ row: r, col: c, valid: validPlacement })));
  };

  const removeShip = (index) => {
    const newPlacedShips = placedShips.filter((_, i) => i !== index);
    setPlacedShips(newPlacedShips);
    
    // หากไม่มีเรือที่เลือกอยู่ ให้เลือกเรือที่ถูกลบ
    if (!currentShip) {
      setCurrentShip(placedShips[index].ship_name);
    }
  };

  const handleFinish = async () => {
    if (placedShips.length !== Object.keys(ships).length) {
      alert('กรุณาวางเรือให้ครบทุกลำ');
      return;
    }

    // ตรวจสอบการวางเรือกับ backend
    try {
      const response = await fetch(`${API_BASE_URL}/ships/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ship_placements: placedShips })
      });

      const result = await response.json();
      
      if (result.success) {
        onShipsPlaced(placedShips);
      } else {
        alert(`ข้อผิดพลาด: ${result.message}`);
      }
    } catch (error) {
      console.error('Error validating ships:', error);
      alert('เกิดข้อผิดพลาดในการตรวจสอบการวางเรือ');
    }
  };

  const getCellContent = (row, col) => {
    // ตรวจสอบ hover
    const hovered = hoveredCells.find(cell => cell.row === row && cell.col === col);
    if (hovered) {
      return hovered.valid ? '🟢' : '🔴';
    }

    // ตรวจสอบเรือที่วางแล้ว
    const placed = previewBoard[row][col];
    if (placed) {
      return '🚢';
    }

    return '';
  };

  const getCellClass = (row, col) => {
    const hovered = hoveredCells.find(cell => cell.row === row && cell.col === col);
    const placed = previewBoard[row][col];

    let baseClass = 'w-8 h-8 border border-gray-300 flex items-center justify-center text-xs cursor-pointer hover:bg-gray-100';

    if (hovered) {
      baseClass += hovered.valid ? ' bg-green-200' : ' bg-red-200';
    } else if (placed) {
      baseClass += ' bg-blue-200';
    }

    return baseClass;
  };

  const remainingShips = Object.keys(ships).filter(
    shipName => !placedShips.some(placed => placed.ship_name === shipName)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>วางเรือของคุณ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ตัวเลือกเรือและทิศทาง */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">เรือที่จะวาง:</label>
              <Select value={currentShip || ''} onValueChange={setCurrentShip}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเรือ" />
                </SelectTrigger>
                <SelectContent>
                  {remainingShips.map(shipName => (
                    <SelectItem key={shipName} value={shipName}>
                      {shipName} (ขนาด {ships[shipName]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">ทิศทาง:</label>
              <Select value={currentDirection} onValueChange={setCurrentDirection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">แนวนอน</SelectItem>
                  <SelectItem value="vertical">แนวตั้ง</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* กระดานวางเรือ */}
          <div className="space-y-2">
            <div className="text-sm font-medium">คลิกที่กระดานเพื่อวางเรือ:</div>
            <div className="inline-block border-2 border-gray-400">
              {/* หัวคอลัมน์ */}
              <div className="flex">
                <div className="w-8 h-8"></div>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="w-8 h-8 flex items-center justify-center text-xs font-bold">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              
              {/* แถวกระดาน */}
              {Array.from({ length: 10 }, (_, row) => (
                <div key={row} className="flex">
                  <div className="w-8 h-8 flex items-center justify-center text-xs font-bold">
                    {row + 1}
                  </div>
                  {Array.from({ length: 10 }, (_, col) => (
                    <div
                      key={col}
                      className={getCellClass(row, col)}
                      onClick={() => handleCellClick(row, col)}
                      onMouseEnter={() => handleCellHover(row, col)}
                      onMouseLeave={() => setHoveredCells([])}
                    >
                      {getCellContent(row, col)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* รายการเรือที่วางแล้ว */}
          {placedShips.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">เรือที่วางแล้ว:</div>
              <div className="space-y-1">
                {placedShips.map((ship, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span className="text-sm">
                      {ship.ship_name} - {String.fromCharCode(65 + ship.start_col)}{ship.start_row + 1} ({ship.direction === 'horizontal' ? 'แนวนอน' : 'แนวตั้ง'})
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeShip(index)}
                    >
                      ลบ
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ปุ่มควบคุม */}
          <div className="flex gap-2">
            <Button
              onClick={handleFinish}
              disabled={placedShips.length !== Object.keys(ships).length}
              className="flex-1"
            >
              เสร็จสิ้น ({placedShips.length}/{Object.keys(ships).length})
            </Button>
            <Button variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipPlacement;

