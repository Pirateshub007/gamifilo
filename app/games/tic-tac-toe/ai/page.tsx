"use client";

import { useEffect, useRef, useState } from "react";
import TicTacToeBoard from "../components/TicTacToeBoard";

type Difficulty = "easy" | "medium" | "hard";
type SymbolType = "X" | "O";
type ThemeType = "blue" | "orange" | "purple" | "green";

type Theme = {
  primary: string;
  secondary: string;
  background: string;
};

type Result = "player" | "computer" | "draw" | null;

const themes: Record<ThemeType, Theme> = {
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
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board: string[]): SymbolType | "draw" | null {
  for (const [a, b, c] of winningLines) {
    if (
      board[a] !== "" &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a] as SymbolType;
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

  if (empty.length === 0) return -1;

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

function minimax(
  board: string[],
  isMaximizing: boolean
): number {
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

      best = Math.max(
        best,
        minimax(copy, false)
      );
    }

    return best;
  }

  let best = Infinity;

  for (let i = 0; i < 9; i++) {
    if (board[i] !== "") continue;

    const copy = [...board];
    copy[i] = "X";

    best = Math.min(
      best,
      minimax(copy, true)
    );
  }

  return best;
}

export default function TicTacToeAIPage() {
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [board, setBoard] = useState<string[]>(
    Array(9).fill("")
  );

  const [turn, setTurn] = useState<SymbolType>("X");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("medium");

  const [themeName, setThemeName] =
    useState<ThemeType>("blue");

  const [playerName, setPlayerName] =
    useState("You");

  const [score, setScore] = useState({
    player: 0,
    computer: 0,
    draw: 0,
  });

  const [result, setResult] =
    useState<Result>(null);

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const theme = themes[themeName];

  useEffect(() => {
    return () => {
      if (aiTimer.current) {
        clearTimeout(aiTimer.current);
        aiTimer.current = null;
      }
    };
  }, []);

  function finishGame(
    winner: SymbolType | "draw"
  ) {
    // Stop any pending AI move immediately.
    if (aiTimer.current) {
      clearTimeout(aiTimer.current);
      aiTimer.current = null;
    }

    // Stop the game from accepting another turn.
    setTurn("X");

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
    // Never move after game has ended.
    if (result !== null) return;

    const currentResult =
      getWinner(currentBoard);

    if (currentResult) {
      finishGame(currentResult);
      return;
    }

    const emptyExists = currentBoard.some(
      (cell) => cell === ""
    );

    if (!emptyExists) {
      finishGame("draw");
      return;
    }

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

    if (move === -1) {
      finishGame("draw");
      return;
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
    // Player can only play on their turn.
    if (turn !== "X") return;

    // Never allow moves after game is finished.
    if (result !== null) return;

    // Cell already occupied.
    if (board[index] !== "") return;

    const nextBoard = [...board];
    nextBoard[index] = "X";

    setBoard(nextBoard);

    const winner = getWinner(nextBoard);

    // VERY IMPORTANT:
    // If player has won/drawn, do NOT start AI timer.
    if (winner) {
      finishGame(winner);
      return;
    }

    setTurn("O");

    // Clear any old timer before creating a new one.
    if (aiTimer.current) {
      clearTimeout(aiTimer.current);
    }

    aiTimer.current = setTimeout(() => {
      aiTimer.current = null;
      computerMove(nextBoard);
    }, 350);
  }

  function restart() {
    if (aiTimer.current) {
      clearTimeout(aiTimer.current);
      aiTimer.current = null;
    }

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

  function renderScoreboard() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "10px",
        }}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: "14px",
            background: "#111722",
            textAlign: "center",
            border:
              turn === "X"
                ? `2px solid ${theme.primary}`
                : "2px solid #303642",
            boxShadow:
              turn === "X"
                ? `0 0 14px ${theme.primary}22`
                : "none",
          }}
        >
          <div style={{ fontSize: "20px" }}>
            ❌
          </div>

          <strong>{playerName}</strong>

          <div
            style={{
              fontSize: "25px",
              color: theme.primary,
              fontWeight: "bold",
              marginTop: "3px",
            }}
          >
            {score.player}
          </div>
        </div>

        <div
          style={{
            padding: "12px",
            borderRadius: "14px",
            background: "#111722",
            textAlign: "center",
            border:
              turn === "O"
                ? `2px solid ${theme.secondary}`
                : "2px solid #303642",
            boxShadow:
              turn === "O"
                ? `0 0 14px ${theme.secondary}22`
                : "none",
          }}
        >
          <div style={{ fontSize: "20px" }}>
            🤖
          </div>

          <strong>Computer</strong>

          <div
            style={{
              fontSize: "25px",
              color: theme.secondary,
              fontWeight: "bold",
              marginTop: "3px",
            }}
          >
            {score.computer}
          </div>
        </div>

        <div
          style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            fontSize: "13px",
            opacity: 0.65,
            paddingTop: "2px",
          }}
        >
          🤝 Draws: {score.draw}
        </div>
      </div>
    );
  }

  function renderStatus() {
    let statusText = "";

    if (result === "player") {
      statusText = `🏆 ${playerName} WINS!`;
    } else if (result === "computer") {
      statusText = "🤖 COMPUTER WINS!";
    } else if (result === "draw") {
      statusText = "🤝 DRAW!";
    } else if (turn === "X") {
      statusText = `❌ ${playerName}'s TURN`;
    } else {
      statusText = "🤖 COMPUTER'S TURN";
    }

    return (
      <div
        style={{
          padding: "12px 18px",
          borderRadius: "14px",
          background: "#111722",
          border: `2px solid ${theme.primary}66`,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {statusText}
      </div>
    );
  }

  function renderActionButtons() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "10px",
        }}
      >
        <button
          onClick={restart}
          style={{
            padding: "11px 12px",
            borderRadius: "10px",
            cursor: "pointer",
            border: `2px solid ${theme.primary}`,
            background: `${theme.primary}22`,
            color: "white",
            fontWeight: "bold",
            boxShadow: `0 0 12px ${theme.primary}33`,
          }}
        >
          🔄 Restart
        </button>

        <button
          onClick={newGame}
          style={{
            padding: "11px 12px",
            borderRadius: "10px",
            cursor: "pointer",
            border: "1px solid #303642",
            background: "#1a202c",
            color: "white",
            fontWeight: "bold",
          }}
        >
          🆕 New Game
        </button>
      </div>
    );
  }

  function renderSettings() {
    return (
      <>
        {/* PLAYER NAME */}
        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            Player Name
          </label>

          <input
            value={playerName}
            maxLength={15}
            onChange={(e) =>
              setPlayerName(e.target.value)
            }
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #3b4352",
              background: "#080b16",
              color: "white",
              outline: "none",
            }}
          />
        </div>

        {/* DIFFICULTY */}
        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              marginBottom: "8px",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            Difficulty
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "8px",
            }}
          >
            {(
              [
                ["easy", "🤖 Easy"],
                ["medium", "🧠 Medium"],
                ["hard", "💀 Hard"],
              ] as [Difficulty, string][]
            ).map(([level, label]) => (
              <button
                key={level}
                onClick={() =>
                  setDifficulty(level)
                }
                style={{
                  padding: "10px 5px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  border:
                    difficulty === level
                      ? `2px solid ${theme.primary}`
                      : "1px solid #3b4352",
                  background:
                    difficulty === level
                      ? `${theme.primary}22`
                      : "#17202e",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* THEME */}
        <div>
          <div
            style={{
              marginBottom: "8px",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            Theme
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "8px",
            }}
          >
            {(
              [
                ["blue", "🔵"],
                ["orange", "🟠"],
                ["purple", "🟣"],
                ["green", "🟢"],
              ] as [ThemeType, string][]
            ).map(([name, emoji]) => (
              <button
                key={name}
                onClick={() =>
                  setThemeName(name)
                }
                style={{
                  padding: "10px 4px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  border:
                    themeName === name
                      ? `2px solid ${theme.primary}`
                      : "1px solid #3b4352",
                  background: "#17202e",
                  color: "white",
                  fontSize: "18px",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  function renderWinnerPopup() {
    if (!result) return null;

    const title =
      result === "player"
        ? `${playerName} WINS!`
        : result === "computer"
        ? "COMPUTER WINS!"
        : "IT'S A DRAW!";

    const icon =
      result === "player"
        ? "🏆"
        : result === "computer"
        ? "🤖"
        : "🤝";

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.72)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            width: "min(90vw, 420px)",
            padding: "30px",
            borderRadius: "22px",
            background: "#111722",
            border: `2px solid ${theme.primary}`,
            boxShadow: `0 0 35px ${theme.primary}55`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "52px",
              marginBottom: "12px",
            }}
          >
            {icon}
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              color: theme.primary,
              fontSize: "28px",
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: "0 0 25px",
              opacity: 0.7,
            }}
          >
            Game Over
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={restart}
              style={{
                padding: "12px 24px",
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

            <button
              onClick={newGame}
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                border: "1px solid #555",
                background: "#1b2230",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              🆕 NEW GAME
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: "white",
        padding: "24px 16px 40px",
        boxSizing: "border-box",
      }}
    >
      {/* TITLE */}
      <header
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto 24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: theme.primary,
            fontSize: "clamp(26px, 5vw, 40px)",
            fontWeight: 900,
          }}
        >
          🤖 TIC TAC TOE
        </h1>

        <p
          style={{
            margin: "7px 0 0",
            fontSize: "13px",
            opacity: 0.6,
          }}
        >
          AI • Single Player
        </p>
      </header>

      {/* DESKTOP */}
      <div className="ttt-desktop">
        <div
          style={{
            width: "min(1100px, 100%)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) 300px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* LEFT */}
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "18px",
              minWidth: 0,
            }}
          >
            {renderStatus()}

            <TicTacToeBoard
              board={board}
              play={play}
              theme={theme}
            />
          </section>

          {/* RIGHT */}
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* SCOREBOARD */}
            <div
              style={{
                background: "#111722",
                border: `2px solid ${theme.primary}55`,
                borderRadius: "18px",
                padding: "14px",
              }}
            >
              {renderScoreboard()}
            </div>

            {/* CONTROLS */}
            <div
              style={{
                background: "#111722",
                border: `2px solid ${theme.primary}55`,
                borderRadius: "18px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  marginBottom: "12px",
                  color: theme.primary,
                  fontSize: "17px",
                  fontWeight: "bold",
                }}
              >
                🎮 Game Controls
              </div>

              {renderActionButtons()}
            </div>

            {/* SETTINGS */}
            <div
              style={{
                background: "#111722",
                border: `2px solid ${theme.primary}55`,
                borderRadius: "18px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  color: theme.primary,
                  fontSize: "17px",
                  fontWeight: "bold",
                }}
              >
                ⚙️ Game Settings
              </div>

              {renderSettings()}
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE */}
      <div className="ttt-mobile">
        <section
          style={{
            width: "min(560px, 100%)",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* SCORE */}
          <div style={{ width: "100%" }}>
            {renderScoreboard()}
          </div>

          {/* STATUS */}
          <div style={{ width: "100%" }}>
            {renderStatus()}
          </div>

          {/* BOARD */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <TicTacToeBoard
              board={board}
              play={play}
              theme={theme}
            />
          </div>

          {/* ACTIONS */}
          <div style={{ width: "100%" }}>
            {renderActionButtons()}
          </div>

          {/* SETTINGS TOGGLE */}
          <button
            onClick={() =>
              setSettingsOpen(!settingsOpen)
            }
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "12px",
              cursor: "pointer",
              border: `1px solid ${theme.primary}66`,
              background: "#111722",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            ⚙️{" "}
            {settingsOpen
              ? "Hide Settings ▲"
              : "Game Settings ▼"}
          </button>

          {/* SETTINGS */}
          {settingsOpen && (
            <div
              style={{
                width: "100%",
                padding: "18px",
                boxSizing: "border-box",
                borderRadius: "18px",
                background: "#111722",
                border: `2px solid ${theme.primary}66`,
              }}
            >
              {renderSettings()}
            </div>
          )}
        </section>
      </div>

      {/* WINNER POPUP */}
      {renderWinnerPopup()}

      {/* RESPONSIVE */}
      <style jsx>{`
        .ttt-desktop {
          display: block;
        }

        .ttt-mobile {
          display: none;
        }

        @media (max-width: 800px) {
          .ttt-desktop {
            display: none;
          }

          .ttt-mobile {
            display: block;
          }
        }
      `}</style>
    </main>
  );
}