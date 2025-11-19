//
// Pure chess logic utilities for the frontend chess app
// Handles moves validation, turn alternation, check, checkmate, castling, pawn promotion, and draw detection
//
// This utility is self-contained and does not depend on external libraries.
//

// Square coordinates helpers
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
function coordsToSquare(x, y) {
  return files[x] + ranks[7 - y];
}
function squareToCoords(square) {
  const file = square.charCodeAt(0) - 97; // 'a'.charCodeAt(0) === 97
  const rank = 8 - parseInt(square[1], 10);
  return [file, rank];
}

// Piece codes: wP, wN, wB, wR, wQ, wK, bP, etc.
const initialBoard = [
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

function cloneBoard(board) {
  return board.map(row => row.slice());
}

// Generate algebraic notation for moves (basic SAN for major moves, for display)
function moveToSAN({ from, to, piece, capture, promotion, isCastlingO, isCastlingOO }) {
  if (isCastlingO) return 'O-O';
  if (isCastlingOO) return 'O-O-O';
  const pieceLetter = piece[1] !== 'P' ? piece[1] : '';
  const captureSymbol = capture ? 'x' : '';
  const toSquare = coordsToSquare(...to);
  const promotionText = promotion ? '=' + promotion[1] : '';
  return `${pieceLetter}${captureSymbol}${toSquare}${promotionText}`;
}

// Utility to detect if a position is within board
function inBounds(x, y) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}

// All piece movement deltas
const deltas = {
  N: [[-2, -1], [-2, 1], [-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2]],
  B: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
  R: [[1, 0], [0, 1], [-1, 0], [0, -1]],
  Q: [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [0, 1], [-1, 0], [0, -1]],
  K: [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [0, 1], [-1, 0], [0, -1]]
};

// Get legal moves for a piece at (x, y) given the current board state and game info
function getLegalMoves(board, x, y, state) {
  const moves = [];
  const piece = board[y][x];
  if (!piece) return moves;
  const color = piece[0];
  const enemy = color === 'w' ? 'b' : 'w';

  // Pawn moves
  if (piece[1] === 'P') {
    const dir = color === 'w' ? -1 : 1;
    const startRank = color === 'w' ? 6 : 1;
    // Move forward
    if (inBounds(x, y + dir) && !board[y + dir][x]) {
      moves.push({ from: [x, y], to: [x, y + dir], piece, promotion: (y + dir === 0 || y + dir === 7) ? [color + 'Q', color + 'R', color + 'N', color + 'B'] : null });
      // Double advance
      if (y === startRank && !board[y + dir * 2][x]) {
        moves.push({ from: [x, y], to: [x, y + dir * 2], piece });
      }
    }
    // Captures
    for (const dx of [-1, 1]) {
      if (inBounds(x + dx, y + dir)) {
        const target = board[y + dir][x + dx];
        // Normal capture
        if (target && target[0] === enemy)
          moves.push({ from: [x, y], to: [x + dx, y + dir], piece, capture: true, promotion: (y + dir === 0 || y + dir === 7) ? [color + 'Q', color + 'R', color + 'N', color + 'B'] : null });
        // En passant
        if (!target && state.enPassantSquare &&
          coordsToSquare(x + dx, y + dir) === state.enPassantSquare) {
          moves.push({ from: [x, y], to: [x + dx, y + dir], piece, capture: true, isEnPassant: true });
        }
      }
    }
  }
  // Knights
  else if (piece[1] === 'N') {
    for (const [dx, dy] of deltas.N) {
      const nx = x + dx, ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const target = board[ny][nx];
      if (!target || target[0] === enemy)
        moves.push({ from: [x, y], to: [nx, ny], piece, capture: !!target });
    }
  }
  // Bishops, Rooks, Queens (sliders)
  else if (['B', 'R', 'Q'].includes(piece[1])) {
    const dirs = deltas[piece[1]];
    for (const [dx, dy] of dirs) {
      for (let step = 1; step < 8; ++step) {
        const nx = x + dx * step, ny = y + dy * step;
        if (!inBounds(nx, ny)) break;
        const target = board[ny][nx];
        if (!target) {
          moves.push({ from: [x, y], to: [nx, ny], piece });
        } else {
          if (target[0] === enemy)
            moves.push({ from: [x, y], to: [nx, ny], piece, capture: true });
          break;
        }
      }
    }
  }
  // King
  else if (piece[1] === 'K') {
    for (const [dx, dy] of deltas.K) {
      const nx = x + dx, ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const target = board[ny][nx];
      if (!target || target[0] === enemy)
        moves.push({ from: [x, y], to: [nx, ny], piece, capture: !!target });
    }
    // Castling
    if (state && color === state.turn && !state.inCheck) {
      // Kingside
      if (
        state.castlingRights[color + 'K'] &&
        !board[y][x + 1] &&
        !board[y][x + 2] &&
        !isAttacked(board, x, y, enemy) &&
        !isAttacked(board, x + 1, y, enemy) &&
        !isAttacked(board, x + 2, y, enemy)
      ) {
        moves.push({ from: [x, y], to: [x + 2, y], piece, isCastlingO: true });
      }
      // Queenside
      if (
        state.castlingRights[color + 'Q'] &&
        !board[y][x - 1] &&
        !board[y][x - 2] &&
        !board[y][x - 3] &&
        !isAttacked(board, x, y, enemy) &&
        !isAttacked(board, x - 1, y, enemy) &&
        !isAttacked(board, x - 2, y, enemy)
      ) {
        moves.push({ from: [x, y], to: [x - 2, y], piece, isCastlingOO: true });
      }
    }
  }
  return moves;
}

// Returns all the moves for a given color (with optional filtering for king safety)
function getAllLegalMoves(board, color, state) {
  let moves = [];
  for (let y = 0; y < 8; ++y) {
    for (let x = 0; x < 8; ++x) {
      const piece = board[y][x];
      if (piece && piece[0] === color) {
        const pieceMoves = getLegalMoves(board, x, y, state);
        moves = moves.concat(pieceMoves);
      }
    }
  }
  // Filter out moves that leave king in check
  return moves.filter(move => !wouldLeaveKingInCheck(board, move, color, state));
}

// Checks if a square is attacked by the enemy
function isAttacked(board, x, y, enemyColor) {
  // Check all squares for enemy moves that would attack (x, y)
  for (let ty = 0; ty < 8; ++ty) {
    for (let tx = 0; tx < 8; ++tx) {
      const piece = board[ty][tx];
      if (piece && piece[0] === enemyColor) {
        const fakeState = {}; // minimal state for getLegalMoves
        const moves = getLegalMoves(board, tx, ty, fakeState);
        for (const move of moves) {
          if (move.to[0] === x && move.to[1] === y) return true;
        }
      }
    }
  }
  return false;
}

// Applies a move and returns the new board and game state
function applyMove(board, move, prevState) {
  let newBoard = cloneBoard(board);
  let state = { ...prevState };

  const [fx, fy] = move.from;
  const [tx, ty] = move.to;
  const piece = board[fy][fx];

  // Move piece
  newBoard[fy][fx] = null; newBoard[ty][tx] = piece;

  // Pawn promotion
  if (move.promotion && move.chosenPromotion) {
    newBoard[ty][tx] = move.chosenPromotion;
  }

  // En passant
  if (move.isEnPassant) {
    newBoard[fy][tx] = null; // remove captured pawn
  }

  // Castling
  if (move.isCastlingO) { // Kingside
    newBoard[fy][fx + 1] = newBoard[fy][fx + 3];
    newBoard[fy][fx + 3] = null;
  }
  if (move.isCastlingOO) { // Queenside
    newBoard[fy][fx - 1] = newBoard[fy][fx - 4];
    newBoard[fy][fx - 4] = null;
  }

  // Update castling rights
  let { castlingRights } = state;
  castlingRights = { ...castlingRights };
  if (piece === 'wK') { castlingRights.wK = false; castlingRights.wQ = false; }
  if (piece === 'bK') { castlingRights.bK = false; castlingRights.bQ = false; }
  if (piece === 'wR' && fy === 7) {
    if (fx === 0) castlingRights.wQ = false;
    if (fx === 7) castlingRights.wK = false;
  }
  if (piece === 'bR' && fy === 0) {
    if (fx === 0) castlingRights.bQ = false;
    if (fx === 7) castlingRights.bK = false;
  }

  // En passant state
  let enPassantSquare = null;
  if (piece[1] === 'P' && Math.abs(ty - fy) === 2) {
    enPassantSquare = coordsToSquare(fx, (fy + ty) / 2);
  }

  // Switch turn
  const turn = prevState.turn === 'w' ? 'b' : 'w';

  // Halfmove clock & fullmove number
  let halfmoveClock = prevState.halfmoveClock + 1;
  if (piece[1] === 'P' || move.capture) halfmoveClock = 0;
  let fullmoveNumber = prevState.fullmoveNumber;
  if (turn === 'w') ++fullmoveNumber;

  // Is new king in check?
  const inCheck = isKingInCheck(newBoard, turn);

  return {
    board: newBoard,
    state: {
      turn,
      castlingRights,
      enPassantSquare,
      inCheck,
      halfmoveClock,
      fullmoveNumber,
      draw: false
    }
  };
}

// Checks if king is in check for given color
function isKingInCheck(board, color) {
  // Find king
  let kingPos = null;
  for (let y = 0; y < 8; ++y)
    for (let x = 0; x < 8; ++x)
      if (board[y][x] === (color + 'K')) kingPos = [x, y];
  if (!kingPos) return false;
  return isAttacked(board, kingPos[0], kingPos[1], color === 'w' ? 'b' : 'w');
}

// Would this move leave king in check?
function wouldLeaveKingInCheck(board, move, color, prevState) {
  const [fx, fy] = move.from, [tx, ty] = move.to;
  const piece = board[fy][fx];
  const target = board[ty][tx];
  let tempBoard = cloneBoard(board);

  // Apply move temporarily
  tempBoard[fy][fx] = null;
  tempBoard[ty][tx] = piece;
  // Handle en passant
  if (move.isEnPassant) tempBoard[fy][tx] = null;
  // Castling
  if (move.isCastlingO) { tempBoard[fy][fx + 1] = tempBoard[fy][fx + 3]; tempBoard[fy][fx + 3] = null; }
  if (move.isCastlingOO) { tempBoard[fy][fx - 1] = tempBoard[fy][fx - 4]; tempBoard[fy][fx - 4] = null; }
  // Promotion
  if (move.promotion && move.chosenPromotion) tempBoard[ty][tx] = move.chosenPromotion;

  return isKingInCheck(tempBoard, color);
}

// Detect checkmate or stalemate
function getGameStatus(board, state) {
  const moves = getAllLegalMoves(board, state.turn, state);
  const inCheck = isKingInCheck(board, state.turn);
  if (moves.length === 0) {
    if (inCheck) return { status: 'checkmate', winner: state.turn === 'w' ? 'Black' : 'White' };
    return { status: 'stalemate', draw: true };
  }
  if (state.halfmoveClock >= 50) return { status: '50-move draw', draw: true };
  // (Threefold repetition/insufficient material not implemented for simplicity)
  return { status: inCheck ? 'check' : 'playing' };
}

// Initial game state
const getInitialState = () => ({
  turn: 'w',
  castlingRights: { wK: true, wQ: true, bK: true, bQ: true },
  enPassantSquare: null,
  inCheck: false,
  halfmoveClock: 0,
  fullmoveNumber: 1,
  draw: false
});

export {
  initialBoard,
  getInitialState,
  getLegalMoves,
  getAllLegalMoves,
  moveToSAN,
  applyMove,
  coordsToSquare,
  squareToCoords,
  getGameStatus,
  cloneBoard
};
