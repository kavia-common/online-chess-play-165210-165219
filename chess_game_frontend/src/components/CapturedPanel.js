import React from 'react';
import ChessPiece from './ChessPiece';

/**
 * PUBLIC_INTERFACE
 * CapturedPanel: shows captured chess pieces for a given side.
 * Props:
 * - pieces: array of piece codes (e.g., ["bN", "bR", ...])
 * - color: 'w' or 'b'
 */
function CapturedPanel({ pieces, color }) {
  // Group captured by type for typical display order
  const typeOrder = color === 'w'
    ? ['bQ', 'bR', 'bB', 'bN', 'bP']
    : ['wQ', 'wR', 'wB', 'wN', 'wP'];

  // Order and count pieces for compact rendering
  const pieceGroups = {};
  for (const t of typeOrder) pieceGroups[t] = [];
  for (const pc of pieces) { if (pieceGroups[pc]) pieceGroups[pc].push(pc); }
  // For any off color/odd pieces, append after standard ordering.
  const others = pieces.filter(pc => !typeOrder.includes(pc));

  return (
    <div
      className={`captured-panel ${color === 'w' ? 'white-panel' : 'black-panel'}`}
      aria-label={color === 'w' ? "Black pieces captured" : "White pieces captured"}
      role="region"
      tabIndex={0}
      style={{
        margin: "0.5rem auto",
        minHeight: 36,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 13,
        padding: '0.4rem 0.6rem',
        background:
          color === 'w'
            ? 'linear-gradient(90deg, #3040560a 60%, #dde4ec22 100%)'
            : 'linear-gradient(90deg, #e9f1ff 40%, #aec3e512 100%)',
        boxShadow:
          color === 'w'
            ? '0 2px 11px 0 rgba(37,99,235,0.02)'
            : '0 1px 8px 0 rgba(37,99,235,0.09)',
        border:
          color === 'w'
            ? '1.5px solid #dee4ec'
            : '1.5px solid #b4cced',
        minWidth: 57,
        maxWidth: 150
      }}
      data-testid={`captured-panel-${color}`}
    >
      {typeOrder.map(t =>
        pieceGroups[t].map((pce, i) => (
          <span key={t + '-' + i} style={{ margin: "0 1.5px" }}>
            <ChessPiece piece={pce} />
          </span>
        ))
      )}
      {others.length > 0 && others.map((p, i) =>
        <span key={"other-" + p + i} style={{ margin: "0 1.5px" }}>
          <ChessPiece piece={p} />
        </span>
      )}
      {pieces.length === 0 && (
        <span
          aria-label="No captured pieces"
          style={{
            color: "#b0b7c4", fontStyle: 'italic', fontSize: 14
          }}
        >None</span>
      )}
    </div>
  );
}

export default CapturedPanel;
