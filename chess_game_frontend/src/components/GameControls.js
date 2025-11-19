import React from 'react';

// PUBLIC_INTERFACE
function GameControls({ onRestart, onResign, disabled, winner, status }) {
  return (
    <div className="game-controls">
      <button className="btn restart-btn" onClick={onRestart} disabled={disabled}>Restart</button>
      <button className="btn resign-btn" onClick={onResign} disabled={disabled || winner}>Resign</button>
      {winner && (
        <div className="game-result">
          <span className="winner">{winner} wins</span>
        </div>
      )}
      {status && !winner && status !== 'playing' && (
        <div className="game-status-info">{status}</div>
      )}
    </div>
  );
}

export default GameControls;
