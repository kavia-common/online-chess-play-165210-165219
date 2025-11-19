import React from 'react';

// Import SVGs as React components for the realistic set
function importAll(r) {
  const map = {};
  r.keys().forEach((key) => {
    const nm = key.replace('./', '').replace('.svg', '');
    map[nm] = r(key).default;
  });
  return map;
}

const realisticAssets = importAll(require.context('../assets/pieces', false, /\.svg$/));

// Simple unicode fallback for "classic" option
const unicodePiece = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

function getPieceAlt(piece) {
  if (!piece) return '';
  const color = piece[0] === 'w' ? 'White' : 'Black';
  const type =
    piece[1] === 'K' ? 'King' :
    piece[1] === 'Q' ? 'Queen' :
    piece[1] === 'R' ? 'Rook' :
    piece[1] === 'N' ? 'Knight' :
    piece[1] === 'B' ? 'Bishop' :
    'Pawn';
  return `${color} ${type}`;
}

// PUBLIC_INTERFACE
/** ChessPiece: renders a chess piece using SVG assets or unicode fallback.
 * Props:
 * - piece: e.g. "wK" "bQ" etc.
 * - theme: "classic" | "realistic" (defaults to realistic)
 */
function ChessPiece({ piece, theme = 'realistic' }) {
  if (!piece) return null;
  let Content = null;

  if (theme === "realistic" && realisticAssets[piece]) {
    Content = (
      // Responsive SVG: uses <img> for accessibility and srcset/alt
      <img
        src={realisticAssets[piece]}
        draggable={false}
        className="chess-piece-img"
        alt={getPieceAlt(piece)}
        width="100%"
        height="100%"
        style={{ display: 'block', pointerEvents: 'none', maxWidth: '100%', maxHeight: '100%' }}
        loading="eager"
      />
    );
  }
  else {
    // Classic fallback (unicode)
    Content = (
      <span
        aria-label={getPieceAlt(piece)}
        style={{
          fontSize: '2.5em',
          color: piece[0] === 'w' ? '#2563EB' : '#212B36',
          textShadow: '0 2px 8px #3978f533',
        }}
      >
        {unicodePiece[piece]}
      </span>
    );
  }
  return (
    <span
      className="chess-piece"
      aria-label={getPieceAlt(piece)}
      tabIndex={-1}
      role="img"
    >
      {Content}
    </span>
  );
}

export default ChessPiece;
