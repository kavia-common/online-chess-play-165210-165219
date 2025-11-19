import React, { useRef, useEffect } from 'react';

// PUBLIC_INTERFACE
function MoveHistoryPanel({ moves }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [moves]);

  return (
    <div className="move-history-panel" role="region" aria-label="Move history">
      <div className="move-history-list">
        {moves.length === 0 ? (
          <span className="move-placeholder">No moves yet</span>
        ) : (
          <ol>
            {moves.map((move, idx) =>
              <li key={idx} className="move-entry">
                <span className="move-num">{Math.floor(idx / 2) + 1}{idx % 2 === 0 ? '.' : '...'}</span>
                <span className={`move-text`}>{move.san}</span>
              </li>
            )}
            <div ref={bottomRef} />
          </ol>
        )}
      </div>
    </div>
  );
}

export default MoveHistoryPanel;
