import React from 'react';

// PUBLIC_INTERFACE
function PlayerPanel({ color, active, inCheck, name }) {
  return (
    <div className={`player-panel ${color} ${active ? 'active' : ''}`}>
      <div className="player-avatar" aria-label={`Player ${color === 'w' ? 'White' : 'Black'}`}>
        {color === 'w'
          ? <span style={{ fontSize: 22, color: '#2563EB' }}>♔</span>
          : <span style={{ fontSize: 22, color: '#212B36' }}>♚</span>}
      </div>
      <div className="player-info">
        <div className="player-name">{name || (color === 'w' ? 'White' : 'Black')}</div>
        <div className={`player-status ${active ? 'active-status' : ''}`}>
          {active
            ? inCheck
              ? <span className="in-check">Check</span>
              : 'Your turn'
            : 'Waiting...'}
        </div>
      </div>
    </div>
  );
}

export default PlayerPanel;
