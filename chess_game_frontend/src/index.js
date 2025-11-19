import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Load components and utils for using code splitting and for future extension points
import './components/ChessBoard';
import './components/ChessPiece';
import './components/PlayerPanel';
import './components/MoveHistoryPanel';
import './components/GameControls';
import './utils/chessLogic';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
