import React from 'react';
import ChessPiece from './ChessPiece';

// PUBLIC_INTERFACE
function ChessBoard({
  board,
  selected,
  legalMoves,
  onSquareClick,
  lastMove,
  checkSquare,
  turn,
  orientation = 'w' // 'w' or 'b'
}) {
  // Reverses board for black orientation if needed
  const renderRows = () => {
    const rows = [];
    for (let y = 0; y < 8; ++y) {
      const boardY = orientation === 'w' ? y : 7 - y;
      rows.push(
        <div className="chess-board-row" key={y}>
          {[...Array(8)].map((_, x) => {
            const boardX = orientation === 'w' ? x : 7 - x;
            const sqKey = `${boardX},${boardY}`;
            const selectedSq = selected && selected[0] === boardX && selected[1] === boardY;
            const legal = legalMoves && legalMoves.some(m => m.to[0] === boardX && m.to[1] === boardY);
            const last = lastMove && ((lastMove.from[0] === boardX && lastMove.from[1] === boardY) || (lastMove.to[0] === boardX && lastMove.to[1] === boardY));
            const inCheck = checkSquare && checkSquare[0] === boardX && checkSquare[1] === boardY;
            const isLight = (boardX + boardY) % 2 === 0;
            return (
              <div
                key={sqKey}
                className={
                  'chess-board-square ' +
                  (isLight ? 'light' : 'dark') +
                  (selectedSq ? ' selected' : '') +
                  (legal ? ' legal' : '') +
                  (last ? ' last' : '') +
                  (inCheck ? ' check' : '')
                }
                onClick={() => onSquareClick([boardX, boardY])}
                tabIndex={0}
                aria-label={`Square ${String.fromCharCode(97 + boardX)}${8-boardY}`}
                role="button"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') onSquareClick([boardX, boardY]);
                }}
              >
                {board[boardY][boardX] &&
                  <ChessPiece
                    piece={board[boardY][boardX]}
                    isWhite={board[boardY][boardX][0] === 'w'}
                  />
                }
              </div>
            );
          })}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="chess-board" role="grid" aria-label="Chess board">
      {renderRows()}
    </div>
  );
}

export default ChessBoard;
