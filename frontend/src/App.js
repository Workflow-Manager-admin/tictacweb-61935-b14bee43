import React, { useState } from 'react';
import './App.css';

/**
 * Color palette based on requirements:
 * --primary: #008080 (teal)
 * --accent:  #ff9800 (orange)
 * --secondary: #975959 (muted wine)
 * --background: #fff (light)
 */

/**
 * Returns the winner ('X' or 'O') or 'draw' (if all cells filled and no winner) or null (ongoing)
 * @param {Array} squares - 9-element array representing the board
 * @returns {'X'|'O'|'draw'|null}
 */
// PUBLIC_INTERFACE
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
      return squares[a];
  }
  if (squares.every(Boolean)) return 'draw';
  return null;
}

// Simple computer move: pick the first available cell (can be improved)
function getComputerMove(squares) {
  // Try to win, block, otherwise pick first
  // 1. Can AI win?
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = 'O';
      if (calculateWinner(copy) === 'O') return i; // win
    }
  }
  // 2. Can block opponent's win?
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = 'X';
      if (calculateWinner(copy) === 'X') return i; // block
    }
  }
  // 3. Take center if available
  if (!squares[4]) return 4;
  // 4. Take random available edge/corner
  const emptyIndices = squares.map((v, i) => v ? null : i).filter(i => i !== null);
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

// Square component
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? ' highlight' : ''}`}
      onClick={onClick}
      aria-label={value || "empty"}
      disabled={!!value}
      tabIndex={value ? -1 : 0}
    >
      {value}
    </button>
  );
}

// Main Game component
// PUBLIC_INTERFACE
function App() {
  // 'local' for two-player, 'single' for vs AI
  const [mode, setMode] = useState('local');
  // X always goes first. 'X' is always the human in single-player.
  const [xIsNext, setXIsNext] = useState(true);
  // 9 element board: 'X', 'O', or null
  const [squares, setSquares] = useState(Array(9).fill(null));
  // Winner: 'X', 'O', 'draw', or null
  const winner = calculateWinner(squares);

  // Highlight the winning combination for UI (not required but enhances UX)
  function getWinningLine(squares) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let l of lines) {
      const [a, b, c] = l;
      if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c])
        return l;
    }
    return [];
  }
  const winningLine = winner && winner !== 'draw' ? getWinningLine(squares) : [];

  // Handle click on board
  // PUBLIC_INTERFACE
  function handleClick(i) {
    if (squares[i] || winner) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  // After each move, if in 'single' mode and computer's turn, make computer move
  React.useEffect(() => {
    if (
      mode === 'single' &&
      !winner &&
      !xIsNext // O (computer) turn
    ) {
      const computerMove = getComputerMove(squares);
      if (computerMove !== undefined) {
        const nextSquares = squares.slice();
        nextSquares[computerMove] = 'O';
        // Delay for natural feel
        const timeout = setTimeout(() => {
          setSquares(nextSquares);
          setXIsNext(true); // Human's turn next
        }, 400);
        return () => clearTimeout(timeout);
      }
    }
  // Intentionally depend on 'squares' and 'xIsNext', 'mode', and 'winner'
  }, [squares, xIsNext, mode, winner]);

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  // PUBLIC_INTERFACE
  function handleChangeMode(newMode) {
    setMode(newMode);
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  // Status banner
  let status;
  if (winner === 'draw') {
    status = <>It's a <span className="accent">draw</span>!</>;
  } else if (winner) {
    status = <><span className={winner === 'X' ? "primary" : "accent"}>{winner}</span> wins!</>;
  } else {
    status = <>
      {mode === 'single'
        ? (xIsNext ? "Your turn (X)" : "AI's turn (O)")
        : (
          <>
            Next: <span className={xIsNext ? "primary" : "accent"}>{xIsNext ? 'X' : 'O'}</span>
          </>
        )
      }
    </>;
  }

  return (
    <div className="ttt-app">
      <h1 className="ttt-title">Tic Tac Toe</h1>
      <div className="ttt-status">{status}</div>
      <div className="ttt-board-container">
        <div className="ttt-board" role="grid" aria-label="Tic Tac Toe Board">
          {squares.map((val, idx) =>
            <Square
              key={idx}
              value={val}
              onClick={() => handleClick(idx)}
              highlight={winningLine.includes(idx)}
            />
          )}
        </div>
      </div>
      <div className="ttt-controls">
        <button
          className="ttt-button"
          onClick={handleRestart}
          aria-label="Restart the game"
        >
          Restart
        </button>
        <button
          className={`ttt-button${mode === 'single' ? ' active' : ''}`}
          onClick={() => handleChangeMode('single')}
          aria-label="Switch to single player"
          disabled={mode === 'single'}
        >
          Single Player
        </button>
        <button
          className={`ttt-button${mode === 'local' ? ' active' : ''}`}
          onClick={() => handleChangeMode('local')}
          aria-label="Switch to two player"
          disabled={mode === 'local'}
        >
          Two Player
        </button>
      </div>
      <footer className="ttt-footer">
        <span>by KAVIA – Minimalistic React Web Game</span>
      </footer>
    </div>
  );
}

export default App;
