import React, { useState } from 'react';
import './App.css';
import './index.css';
import ChessBoard from './components/ChessBoard';
import MoveHistoryPanel from './components/MoveHistoryPanel';
import PlayerPanel from './components/PlayerPanel';
import GameControls from './components/GameControls';
import CapturedPanel from './components/CapturedPanel';
import {
  initialBoard,
  getInitialState,
  getAllLegalMoves,
  getLegalMoves,
  moveToSAN,
  applyMove,
  coordsToSquare,
  getGameStatus,
  cloneBoard
} from './utils/chessLogic';

// Ocean Professional theme colors
const themeData = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  error: '#EF4444',
  surface: '#ffffff',
  background: '#f9fafb',
  text: '#111827'
};

/**
 * ChessApp: main app component for Chess Game frontend
 */
function App() {
  // Game state
  const [board, setBoard] = useState(cloneBoard(initialBoard));
  const [gameState, setGameState] = useState(getInitialState());
  const [history, setHistory] = useState([]);
  // Captured pieces: whiteCaptured (by black), blackCaptured (by white)
  const [whiteCaptured, setWhiteCaptured] = useState([]); // Array of "bQ" etc. (pieces captured by White)
  const [blackCaptured, setBlackCaptured] = useState([]); // Array of "wQ" etc. (pieces captured by Black)
  // UI state
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [promotionMove, setPromotionMove] = useState(null);
  const [orientation, setOrientation] = useState('w'); // 'w' always at bottom for local play

  // Reset game
  function handleRestart() {
    setBoard(cloneBoard(initialBoard));
    setGameState(getInitialState());
    setHistory([]);
    setWhiteCaptured([]);
    setBlackCaptured([]);
    setSelected(null);
    setLegalMoves([]);
    setPromotionMove(null);
  }

  // Resign: set winner
  function handleResign() {
    setGameState(g => ({
      ...g,
      resign: true,
      winner: g.turn === 'w' ? 'Black' : 'White',
      status: 'resigned'
    }));
  }

  // Click square logic: selection and move handling
  function handleSquareClick([x, y]) {
    if (promotionMove) return; // Block selection during promotion
    // Get current turn and valid moves
    if (gameState.resign || gameState.winner || getGameStatus(board, gameState).status === 'checkmate') return;
    if (!selected) {
      // First click: select a piece if it's player's turn
      const piece = board[y][x];
      if (piece && piece[0] === gameState.turn) {
        const pieceMoves = getLegalMoves(board, x, y, gameState)
          .filter(m => !wouldLeaveKingInCheck(board, m, gameState.turn, gameState));
        setSelected([x, y]);
        setLegalMoves(pieceMoves);
      }
    } else {
      // If click an allowed destination
      const found = legalMoves.find(m => m.to[0] === x && m.to[1] === y);
      if (found) {
        // If promotion is needed (pawn to the end rank), ask promotion
        if (found.promotion) {
          setPromotionMove({ ...found, availablePromotions: found.promotion });
        } else {
          doMove(found);
        }
        setSelected(null);
        setLegalMoves([]);
      } else {
        // Deselect if clicking outside legal move or selecting own piece
        const piece = board[y][x];
        if (piece && piece[0] === gameState.turn) {
          const pieceMoves = getLegalMoves(board, x, y, gameState)
            .filter(m => !wouldLeaveKingInCheck(board, m, gameState.turn, gameState));
          setSelected([x, y]);
          setLegalMoves(pieceMoves);
        } else {
          setSelected(null);
          setLegalMoves([]);
        }
      }
    }
  }

  // Confirm promotion (via buttons/popup)
  function handlePromotionSelect(pieceCode) {
    if (promotionMove) {
      const move = { ...promotionMove, chosenPromotion: pieceCode };
      doMove(move);
      setPromotionMove(null);
    }
  }

  // Apply a move, update board/state/history and exposures captured logic
  function doMove(move) {
    const res = applyMove(board, move, gameState);
    const statusObj = getGameStatus(res.board, res.state);
    // Prepare move SAN for history
    const san = moveToSAN({
      ...move,
      piece: board[move.from[1]][move.from[0]],
      capture: !!(board[move.to[1]][move.to[0]] || move.isEnPassant),
      isCastlingO: !!move.isCastlingO,
      isCastlingOO: !!move.isCastlingOO,
      promotion: move.chosenPromotion
    });
    setBoard(res.board);
    setGameState({
      ...res.state,
      status: statusObj.status,
      winner: statusObj.winner,
      draw: !!statusObj.draw
    });
    setHistory([...history, { move, san }]);

    // Captured piece logic: update side arrays
    if (res.captured) {
      if (res.captured[0] === "w") setBlackCaptured(k => [...k, res.captured]);
      else if (res.captured[0] === "b") setWhiteCaptured(k => [...k, res.captured]);
    }

    setSelected(null);
    setLegalMoves([]);
  }

  // Styling: theme variables
  React.useEffect(() => {
    Object.entries(themeData).forEach(([k, v]) =>
      document.documentElement.style.setProperty(`--${k}`, v)
    );
  }, []);

  // Find last move to highlight squares
  const lastMove = history.length ? history[history.length - 1].move : null;
  // Find checked king square for highlight
  let checkSquare = null;
  if (gameState.status === 'check' || gameState.status === 'checkmate') {
    for (let y = 0; y < 8; ++y)
      for (let x = 0; x < 8; ++x)
        if (board[y][x] === (gameState.turn === 'w' ? 'bK' : 'wK'))
          checkSquare = [x, y];
  }

  // Accessibility: announce check/checkmate/status
  React.useEffect(() => {
    if (gameState.status && gameState.status !== 'playing') {
      const liveRegion = document.getElementById('aria-live-game-status');
      if (liveRegion) liveRegion.innerText = gameState.status;
    }
  }, [gameState.status]);

  return (
    <div className="chess-root-app" style={{ background: 'var(--background)' }}>
      <main className="chess-app-main">

        {/* Left: Black side panel */}
        <div className="chess-side-panel left" style={{gap: '0.3rem', alignItems: 'center'}}>
          {/* Show black's captured panel on left - white's captures */}
          <CapturedPanel pieces={whiteCaptured} color="w" />
          <PlayerPanel
            color="b"
            active={gameState.turn === 'b' && !gameState.resign && !gameState.winner}
            inCheck={gameState.status === 'check' && gameState.turn === 'b'}
            name="Black"
          />
        </div>

        {/* Center: board and white panel below, plus captured */}
        <section className="chess-center-panel">

          <div className="chess-top-bar">
            <GameControls
              onRestart={handleRestart}
              onResign={handleResign}
              disabled={!!gameState.resign || !!gameState.winner || !!gameState.draw}
              winner={gameState.winner}
              status={gameState.status}
            />
          </div>

          <ChessBoard
            board={board}
            selected={selected}
            legalMoves={legalMoves}
            onSquareClick={handleSquareClick}
            lastMove={lastMove}
            checkSquare={checkSquare}
            turn={gameState.turn}
            orientation={orientation}
            theme="marble"
          />

          {promotionMove && (
            <div className="promotion-popup-backdrop" tabIndex={-1} onClick={() => setPromotionMove(null)}>
              <div className="promotion-popup" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="promotion-title">Choose promotion</div>
                <div className="promotion-choices">
                  {promotionMove.availablePromotions.map(pc =>
                    <button
                      key={pc}
                      className="promotion-choice"
                      onClick={() => handlePromotionSelect(pc)}
                      aria-label={pc[1] === 'Q' ? 'Queen' : pc[1] === 'R' ? 'Rook' : pc[1] === 'B' ? 'Bishop' : 'Knight'}
                    >
                      {pc[1] === 'Q' ? '♕' : pc[1] === 'R' ? '♖' : pc[1] === 'B' ? '♗' : '♘'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div id="aria-live-game-status" aria-live="polite" className="sr-only" />
          {/* White player panel, then captured (black's captures) */}
          <PlayerPanel
            color="w"
            active={gameState.turn === 'w' && !gameState.resign && !gameState.winner}
            inCheck={gameState.status === 'check' && gameState.turn === 'w'}
            name="White"
          />
          <CapturedPanel pieces={blackCaptured} color="b" />
        </section>

        {/* Right: Move history panel */}
        <aside className="chess-side-panel right" style={{alignItems:'flex-start',justifyContent:'flex-start'}}>
          <MoveHistoryPanel moves={history} />
        </aside>
      </main>
    </div>
  );
}

export default App;

function wouldLeaveKingInCheck(board, move, color, state) {
  // Small wrap for import compatibility
  // The logic is already present in chessLogic.js
  // This can be further integrated/refactored for more extensibility
  const { wouldLeaveKingInCheck } = require('./utils/chessLogic');
  return wouldLeaveKingInCheck ? wouldLeaveKingInCheck(board, move, color, state) : false;
}
