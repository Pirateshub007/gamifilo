"use client";

import { useState } from "react";
import TicTacToeBoard from "../components/TicTacToeBoard";

type Difficulty = "easy" | "medium" | "hard";
type Symbol = "X" | "O";

const themes = {
  blue: {
    primary: "#00bfff",
    secondary: "#00e5ff",
    background: "#080b16",
  },
  orange: {
    primary: "#ff9800",
    secondary: "#ffc107",
    background: "#15100a",
  },
  purple: {
    primary: "#b026ff",
    secondary: "#ff00ff",
    background: "#120820",
  },
  green: {
    primary: "#00ff88",
    secondary: "#00ff00",
    background: "#06120c",
  },
};

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 4, 6],
  [0, 4, 8],
];

function getWinner(board: string[]) {
  for (const [a, b, c] of winningLines) {
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a] as Symbol;
    }
  }

  if (board.every((cell) => cell !== "")) {
    return "draw";
  }

  return null;
}

function getRandomMove(board: string[]) {
  const empty = board
    .map((cell, index) => (cell === "" ? index : -1))
    .filter((index) => index !== -1);

  return empty[Math.floor(Math.random() * empty.length)];
}

function getBestMove(board: string[]) {
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] !== "") continue;

    const copy = [...board];
    copy[i] = "O";

    const score = minimax(copy, false);

    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }

  return move;
}

function minimax(board: string[], isMaximizing: boolean): number {
  const winner = getWinner(board);

  if (winner === "O") return 10;
  if (winner === "X") return -10;
  if (winner === "draw") return 0;

  if (isMaximizing) {
    let best = -Infinity;

    for (let i = 0; i < 9; i++) {
      if (board[i] !== "") continue;

      const copy = [...board];
      copy[i] = "O";

      best = Math.max(best, minimax(copy, false));
    }

    return best;
  }

  let best = Infinity;

  for (let i = 0; i < 9; i++) {
    if (board[i] !== "") continue;

    const copy = [...board];
    copy[i] = "X";

    best = Math.min(best, minimax(copy, true));
  }

  return best;
}

export default function TicTacToeAIPage() {
  const [board, setBoard] = useState<string[]>(
    Array(9).fill("")
  );

  const [turn, setTurn] = useState<Symbol>("X");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("medium");

  const [themeName, setThemeName] =
    useState<keyof typeof themes>("blue");

  const [playerName, setPlayerName] =
    useState("You");

  const [score, setScore] = useState({
    player: 0,
    computer: 0,
    draw: 0,
  });

  const [result, setResult] = useState<
    "player" | "computer" | "draw" | null
  >(null);

  const theme = themes[themeName];

  function finishGame(winner: Symbol | "draw") {
    if (winner === "X") {
      setResult("player");

      setScore((prev) => ({
        ...prev,
        player: prev.player + 1,
      }));
    } else if (winner === "O") {
      setResult("computer");

      setScore((prev) => ({
        ...prev,
        computer: prev.computer + 1,
      }));
    } else {
      setResult("draw");

      setScore((prev) => ({
        ...prev,
        draw: prev.draw + 1,
      }));
    }
  }

  function computerMove(currentBoard: string[]) {
    const emptyExists = currentBoard.some(
      (cell) => cell === ""
    );

    if (!emptyExists) return;

    let move: number;

    if (difficulty === "easy") {
      move = getRandomMove(currentBoard);
    } else if (difficulty === "medium") {
      if (Math.random() < 0.55) {
        move = getBestMove(currentBoard);
      } else {
        move = getRandomMove(currentBoard);
      }
    } else {
      move = getBestMove(currentBoard);
    }

    const nextBoard = [...currentBoard];
    nextBoard[move] = "O";

    setBoard(nextBoard);

    const winner = getWinner(nextBoard);

    if (winner) {
      finishGame(winner);
      return;
    }

    setTurn("X");
  }

  function play(index: number) {
    if (turn !== "X") return;
    if (board[index] !== "") return;
    if (result !== null) return;

    const nextBoard = [...board];
    nextBoard[index] = "X";

    setBoard(nextBoard);

    const winner = getWinner(nextBoard);

    if (winner) {
      finishGame(winner);
      return;
    }

    setTurn("O");

    setTimeout(() => {
      computerMove(nextBoard);
    }, 350);
  }

  function restart() {
    setBoard(Array(9).fill(""));
    setTurn("X");
    setResult(null);
  }

  function newGame() {
    restart();

    setScore({
      player: 0,
      computer: 0,
      draw: 0,
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ color: theme.primary }}>
        🤖 TIC TAC TOE
      </h1>

      <div
        style={{
          display: "flex",
          gap: "12px",
          width: "min(90vw,500px)",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "14px",
            background: "#111722",
            textAlign: "center",
            border:
              turn === "X"
                ? `2px solid ${theme.primary}`
                : "2px solid #303642",
          }}
        >
          ❌
          <br />
          <strong>{playerName}</strong>
          <div
            style={{
              fontSize: "25px",
              color: theme.primary,
              fontWeight: "bold",
            }}
          >
            {score.player}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "14px",
            background: "#111722",
            textAlign: "center",
            border:
              turn === "O"
                ? `2px solid ${theme.secondary}`
                : "2px solid #303642",
          }}
        >
          🤖
          <br />
          <strong>Computer</strong>
          <div
            style={{
              fontSize: "25px",
              color: theme.secondary,
              fontWeight: "bold",
            }}
          >
            {score.computer}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
          maxLength={15}
          style={{
            padding: "10px",
            borderRadius: "10px",
            background: "#111722",
            color: "white",
            border: "1px solid #444",
          }}
        />

        <select
  value={difficulty}
  onChange={(e) =>
    setDifficulty(e.target.value as Difficulty)
  }
  style={{
    padding: "10px 14px",
    borderRadius: "10px",
    background: "#111722",
    color: "white",
    border: `2px solid ${theme.primary}`,
    fontWeight: "bold",
    cursor: "pointer",
    outline: "none",
  }}
>
          <option value="easy">🤖 Easy</option>
          <option value="medium">🧠 Medium</option>
          <option value="hard">💀 Hard</option>
        </select>

        <button
          onClick={() => setThemeName("blue")}
        >
          🔵
        </button>

        <button
          onClick={() => setThemeName("orange")}
        >
          🟠
        </button>

        <button
          onClick={() => setThemeName("purple")}
        >
          🟣
        </button>

        <button
          onClick={() => setThemeName("green")}
        >
          🟢
        </button>
      </div>

      <div
        style={{
          padding: "12px 25px",
          borderRadius: "14px",
          background: "#111722",
          border: `2px solid ${theme.primary}`,
          fontWeight: "bold",
        }}
      >
        {result === "player" && `🏆 ${playerName} WINS!`}
        {result === "computer" && "🤖 COMPUTER WINS!"}
        {result === "draw" && "🤝 DRAW!"}

        {!result &&
          (turn === "X"
            ? `❌ ${playerName}'s TURN`
            : "🤖 COMPUTER'S TURN")}
      </div>

      <TicTacToeBoard
        board={board}
        play={play}
        theme={theme}
      />

      {result && (
        <button
          onClick={restart}
          style={{
            padding: "12px 25px",
            borderRadius: "12px",
            border: `2px solid ${theme.primary}`,
            background: theme.primary,
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          🔄 PLAY AGAIN
        </button>
      )}

      <button
        onClick={newGame}
        style={{
          padding: "10px 20px",
          borderRadius: "10px",
          border: "1px solid #555",
          background: "#111722",
          color: "white",
          cursor: "pointer",
        }}
      >
        🆕 NEW GAME
      </button>

      <div
        style={{
          opacity: 0.65,
          fontSize: "14px",
        }}
      >
        Draws: {score.draw}
      </div>
    </main>
  );
}