import React from 'react';

// SVGs generated for Ocean Professional style (blue/amber, clean modern)
const pieceSvgs = {
  wK: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#E0EDFF" stroke="#3978F5" strokeWidth="3"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#3978F5">♔</text>
    </svg>
  ),
  wQ: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#F7F8FA" stroke="#2563EB" strokeWidth="3"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#2563EB">♕</text>
    </svg>
  ),
  wR: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#E8F1FD" stroke="#2563EB" strokeWidth="3"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#2563EB">♖</text>
    </svg>
  ),
  wB: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#FDF5E7" stroke="#F59E0B" strokeWidth="3"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#F59E0B">♗</text>
    </svg>
  ),
  wN: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#F8FAFF" stroke="#3978F5" strokeWidth="3"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#3978F5">♘</text>
    </svg>
  ),
  wP: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#F8FAFF" stroke="#3978F5" strokeWidth="2"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="20" fill="#3978F5">♙</text>
    </svg>
  ),
  bK: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#314559" stroke="#2563EB" strokeWidth="3"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#ffffff">♚</text>
    </svg>
  ),
  bQ: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#344960" stroke="#3978F5" strokeWidth="3"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#ffffff">♛</text>
    </svg>
  ),
  bR: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#212B36" stroke="#2563EB" strokeWidth="3"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#ffffff">♜</text>
    </svg>
  ),
  bB: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#2F2D36" stroke="#F59E0B" strokeWidth="3"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#F59E0B">♝</text>
    </svg>
  ),
  bN: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#34374C" stroke="#3978F5" strokeWidth="3"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#ffffff">♞</text>
    </svg>
  ),
  bP: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <circle cx="22.5" cy="22.5" r="20" fill="#26344D" stroke="#3978F5" strokeWidth="2"/>
      <text x="22.5" y="28" textAnchor="middle" fontWeight="bold" fontSize="20" fill="#ffffff">♟</text>
    </svg>
  ),
}

// PUBLIC_INTERFACE
function ChessPiece({ piece }) {
  return (
    <span className="chess-piece" aria-label={piece}>
      {pieceSvgs[piece]}
    </span>
  );
}

export default ChessPiece;
