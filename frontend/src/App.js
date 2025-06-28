import React, { useState } from 'react';
import './App.css';

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

// Simple computer move: pick the best (win/block/center/else random)
function getComputerMove(squares) {
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = 'O';
      if (calculateWinner(copy) === 'O') return i;
    }
  }
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = 'X';
      if (calculateWinner(copy) === 'X') return i;
    }
  }
  if (!squares[4]) return 4;
  const emptyIndices = squares.map((v, i) => v ? null : i).filter(i => i !== null);
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

// Square component, with retro effect
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? ' highlight' : ''}`}
      onClick={onClick}
      aria-label={value || "empty"}
      disabled={!!value}
      tabIndex={value ? -1 : 0}
      style={
        value === "X"
          ? { color: "var(--primary)", textShadow: "0 2px 6px #21e6c1", fontWeight: 900 }
          : value === "O"
          ? { color: "var(--accent)", textShadow: "0 2px 6px #ff9800", fontWeight: 900 }
          : {}
      }
    >
      {value ? (value === "X" ? "X" : "O") : ""}
    </button>
  );
}

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

  // Highlight the winning combination for UI (retro blinking border not required for retro)
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

  // PUBLIC_INTERFACE
  function handleClick(i) {
    if (squares[i] || winner) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  // Effect: after player's move, let computer play in 'single' mode
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
        const timeout = setTimeout(() => {
          setSquares(nextSquares);
          setXIsNext(true);
        }, 430);
        return () => clearTimeout(timeout);
      }
    }
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
    status = <>NO WINNER – <span className="accent">DRAW</span>!</>;
  } else if (winner) {
    status = <>
      WINNER:&nbsp;
      <span className={winner === 'X' ? "primary" : "accent"}>
        {winner === "X" ? "PLAYER X" : (mode === "single" && winner === "O" ? "AI (O)" : "PLAYER O")}
      </span>
      &nbsp;🎉
    </>;
  } else {
    status = (
      <>
        {
          mode === 'single'
            ? (xIsNext
              ? <><span className="primary">Your turn</span> <small style={{ color: "#708090" }}>(X)</small></>
              : <><span className="accent">AI is thinking…</span> <small style={{ color: "#708090" }}>(O)</small></>)
            : (
              <>
                NEXT: <span className={xIsNext ? "primary" : "accent"}>
                  {xIsNext ? 'PLAYER X' : 'PLAYER O'}
                </span>
              </>
            )
        }
      </>
    );
  }

  return (
    <div className="ttt-app">
      <h1 className="ttt-title">TIC TAC TOE</h1>
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
        <span>RETRO T3 – Powered by React • Inspired by Arcade Classics</span>
      </footer>
    </div>
  );
}

export default App;
