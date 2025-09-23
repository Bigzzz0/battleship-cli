import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

const GameHistory = ({ gameId, onClose }) => {
  const [history, setHistory] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    if (gameId) {
      fetchGameHistory();
      fetchGameStatistics();
    }
  }, [gameId]);

  const fetchGameHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  };

  const fetchGameStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/statistics`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching game statistics:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="text-center">Loading history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Card */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle>Game Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{statistics.total_shots}</div>
                <div className="text-gray-600">Total Shots</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{statistics.player_hits}</div>
                <div className="text-gray-600">Player Hits</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{statistics.player_hit_rate.toFixed(1)}%</div>
                <div className="text-gray-600">Hit Rate</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">
                  {statistics.duration_seconds ? `${Math.round(statistics.duration_seconds)}s` : 'In Progress'}
                </div>
                <div className="text-gray-600">Duration</div>
              </div>
            </div>
            
            {statistics.winner && (
              <div className="mt-4 text-center">
                <div className="text-lg font-bold">
                  Winner: {statistics.winner === 'player' ? '🎉 Player' : '🤖 AI'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shot History Card */}
      {history && history.shots && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Shot History</CardTitle>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {history.shots.map((shot, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      shot.player === 'ai' ? 'bg-red-50' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-gray-200 px-1 rounded">
                        #{shot.shot_number}
                      </span>
                      <span className="font-bold">
                        {shot.player === 'ai' ? '🤖' : '👤'} {shot.position}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        shot.result === 'hit' ? 'bg-red-200 text-red-800' :
                        shot.result === 'miss' ? 'bg-blue-200 text-blue-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {shot.result === 'hit' ? '💥 HIT' : 
                         shot.result === 'miss' ? '💧 MISS' : 
                         shot.result.toUpperCase()}
                      </span>
                      
                      {shot.ship_sunk && (
                        <span className="text-xs bg-orange-200 text-orange-800 px-1 rounded">
                          🚢 SUNK
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {history.shots.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No shots fired yet
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameHistory;

