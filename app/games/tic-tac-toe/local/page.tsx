"use client";

import { useState } from "react";
import TicTacToeBoard from "../components/TicTacToeBoard";
import TicTacToeScoreboard from "../components/TicTacToeScoreboard";

type SymbolType = "X" | "O";
type ThemeType = "blue" | "orange" | "purple" | "green";

type Theme = {
  primary: string;
  secondary: string;
  background: string;
};

type Score = {
  X: number;
  O: number;
  draw: number;
};

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

export default function TicTacToePage() {
  const [board, setBoard] = useState<string[]>(
    Array(9).fill("")
  );

  const [turn, setTurn] = useState<SymbolType>("X");

  const [theme, setTheme] =
    useState<ThemeType>("blue");

  const [player1Name, setPlayer1Name] =
    useState("Player 1");

  const [player2Name, setPlayer2Name] =
    useState("Player 2");

  const [player1Symbol, setPlayer1Symbol] =
    useState<SymbolType>("X");

  const player2Symbol: SymbolType =
    player1Symbol === "X" ? "O" : "X";

  const [score, setScore] = useState<Score>({
    X: 0,
    O: 0,
    draw: 0,
  });

  const [winner, setWinner] =
    useState<SymbolType | "draw" | null>(null);

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const currentTheme = themes[theme];

  function getPlayerName(symbol: SymbolType) {
    return symbol === player1Symbol
      ? player1Name
      : player2Name;
  }

  function play(index: number) {
    if (
      board[index] !== "" ||
      winner !== null
    ) {
      return;
    }

    const newBoard = [...board];

    newBoard[index] = turn;

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

    const hasWinner = winningLines.some(
      ([a, b, c]) => {
        return (
          newBoard[a] !== "" &&
          newBoard[a] === newBoard[b] &&
          newBoard[a] === newBoard[c]
        );
      }
    );

    setBoard(newBoard);

    if (hasWinner) {
      setWinner(turn);

      setScore((prev) => ({
        ...prev,
        [turn]: prev[turn] + 1,
      }));

      return;
    }

    const isDraw = newBoard.every(
      (cell) => cell !== ""
    );

    if (isDraw) {
      setWinner("draw");

      setScore((prev) => ({
        ...prev,
        draw: prev.draw + 1,
      }));

      return;
    }

    setTurn(
      turn === "X" ? "O" : "X"
    );
  }

  function restart() {
    setBoard(Array(9).fill(""));
    setTurn(player1Symbol);
    setWinner(null);
  }

  function newGame() {
    setBoard(Array(9).fill(""));
    setTurn(player1Symbol);
    setWinner(null);

    setScore({
      X: 0,
      O: 0,
      draw: 0,
    });
  }

  function changePlayer1Symbol(
    symbol: SymbolType
  ) {
    setPlayer1Symbol(symbol);

    setBoard(Array(9).fill(""));
    setWinner(null);
    setTurn(symbol);
  }

  function renderScoreboard() {
    return (
      <TicTacToeScoreboard
        player1Name={player1Name}
        player2Name={player2Name}
        player1Symbol={player1Symbol}
        player2Symbol={player2Symbol}
        score={score}
        turn={turn}
        winner={winner}
        primary={currentTheme.primary}
        secondary={currentTheme.secondary}
      />
    );
  }

  function renderWinnerCard() {
    if (!winner) return null;

    return (
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          padding: "20px",
          boxSizing: "border-box",
          borderRadius: "18px",
          textAlign: "center",
          background: "#111722",
          border: `2px solid ${
            winner === "draw"
              ? "#ffffff"
              : currentTheme.primary
          }`,
          boxShadow: `0 0 25px ${
            winner === "draw"
              ? "#ffffff33"
              : currentTheme.primary + "66"
          }`,
        }}
      >
        {winner === "draw" ? (
          <>
            <div
              style={{
                fontSize: "32px",
              }}
            >
              🤝
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              IT'S A DRAW!
            </div>

            <div
              style={{
                marginTop: "4px",
                opacity: 0.7,
              }}
            >
              Nobody wins this round.
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "34px",
              }}
            >
              🏆
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "26px",
                fontWeight: "bold",
                color: currentTheme.primary,
              }}
            >
              {getPlayerName(winner)} WINS!
            </div>

            <div
              style={{
                marginTop: "4px",
                opacity: 0.7,
              }}
            >
              {winner === "X"
                ? "❌ X"
                : "⭕ O"}{" "}
              completed the winning line.
            </div>
          </>
        )}
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
        {/* RESTART — HIGHLIGHTED */}
        <button
          onClick={restart}
          style={{
            padding: "11px 12px",
            borderRadius: "10px",
            cursor: "pointer",
            border: `2px solid ${currentTheme.primary}`,
            background: `${currentTheme.primary}22`,
            color: "white",
            fontWeight: "bold",
            boxShadow: `0 0 12px ${currentTheme.primary}44`,
          }}
        >
          🔄 Restart
        </button>

        {/* NEW GAME — NORMAL */}
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
        {/* PLAYER 1 */}
        <div
          style={{
            marginBottom: "16px",
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
            Player 1 Name
          </label>

          <input
            value={player1Name}
            maxLength={20}
            onChange={(e) =>
              setPlayer1Name(e.target.value)
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

        {/* PLAYER 2 */}
        <div
          style={{
            marginBottom: "16px",
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
            Player 2 Name
          </label>

          <input
            value={player2Name}
            maxLength={20}
            onChange={(e) =>
              setPlayer2Name(e.target.value)
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

        {/* SYMBOL */}
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
            Player 1 Symbol
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "8px",
            }}
          >
            <button
              onClick={() =>
                changePlayer1Symbol("X")
              }
              style={{
                padding: "11px",
                borderRadius: "10px",
                border:
                  player1Symbol === "X"
                    ? `3px solid ${currentTheme.primary}`
                    : "2px solid #555",
                background:
                  player1Symbol === "X"
                    ? currentTheme.primary
                    : "#222",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ❌ X
            </button>

            <button
              onClick={() =>
                changePlayer1Symbol("O")
              }
              style={{
                padding: "11px",
                borderRadius: "10px",
                border:
                  player1Symbol === "O"
                    ? `3px solid ${currentTheme.secondary}`
                    : "2px solid #555",
                background:
                  player1Symbol === "O"
                    ? currentTheme.secondary
                    : "#222",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ⭕ O
            </button>
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "12px",
              opacity: 0.65,
            }}
          >
            {player1Name}: {player1Symbol}
            {"  |  "}
            {player2Name}: {player2Symbol}
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
            <button
              onClick={() =>
                setTheme("blue")
              }
              style={{
                padding: "10px 4px",
                borderRadius: "10px",
                cursor: "pointer",
                border:
                  theme === "blue"
                    ? `2px solid ${currentTheme.primary}`
                    : "1px solid #3b4352",
                background: "#17202e",
                color: "white",
                fontSize: "18px",
              }}
            >
              🔵
            </button>

            <button
              onClick={() =>
                setTheme("orange")
              }
              style={{
                padding: "10px 4px",
                borderRadius: "10px",
                cursor: "pointer",
                border:
                  theme === "orange"
                    ? `2px solid ${currentTheme.primary}`
                    : "1px solid #3b4352",
                background: "#17202e",
                color: "white",
                fontSize: "18px",
              }}
            >
              🟠
            </button>

            <button
              onClick={() =>
                setTheme("purple")
              }
              style={{
                padding: "10px 4px",
                borderRadius: "10px",
                cursor: "pointer",
                border:
                  theme === "purple"
                    ? `2px solid ${currentTheme.primary}`
                    : "1px solid #3b4352",
                background: "#17202e",
                color: "white",
                fontSize: "18px",
              }}
            >
              🟣
            </button>

            <button
              onClick={() =>
                setTheme("green")
              }
              style={{
                padding: "10px 4px",
                borderRadius: "10px",
                cursor: "pointer",
                border:
                  theme === "green"
                    ? `2px solid ${currentTheme.primary}`
                    : "1px solid #3b4352",
                background: "#17202e",
                color: "white",
                fontSize: "18px",
              }}
            >
              🟢
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: currentTheme.background,
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
            color: currentTheme.primary,
            fontSize:
              "clamp(26px, 5vw, 40px)",
            fontWeight: 900,
            letterSpacing: "0.02em",
          }}
        >
          🎮 TIC TAC TOE
        </h1>

        <p
          style={{
            margin: "7px 0 0",
            fontSize: "13px",
            opacity: 0.6,
          }}
        >
          Local Multiplayer
        </p>
      </header>

      {/* =========================
          DESKTOP
          ========================= */}
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
          {/* LEFT — BOARD */}
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "18px",
              minWidth: 0,
            }}
          >
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
                theme={currentTheme}
              />
            </div>

            {renderWinnerCard()}
          </section>

          {/* RIGHT — SCOREBOARD + CONTROLS */}
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
                border: `2px solid ${currentTheme.primary}55`,
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
                border: `2px solid ${currentTheme.primary}55`,
                borderRadius: "18px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  marginBottom: "12px",
                  color: currentTheme.primary,
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
                border: `2px solid ${currentTheme.primary}55`,
                borderRadius: "18px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  color: currentTheme.primary,
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

      {/* =========================
          MOBILE
          ========================= */}
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
          {/* SCOREBOARD */}
          <div
            style={{
              width: "100%",
            }}
          >
            {renderScoreboard()}
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
              theme={currentTheme}
            />
          </div>

          {/* WINNER */}
          {renderWinnerCard()}

          {/* ACTION BUTTONS */}
          <div
            style={{
              width: "100%",
            }}
          >
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
              border: `1px solid ${currentTheme.primary}66`,
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

          {/* MOBILE SETTINGS */}
          {settingsOpen && (
            <div
              style={{
                width: "100%",
                padding: "18px",
                boxSizing: "border-box",
                borderRadius: "18px",
                background: "#111722",
                border: `2px solid ${currentTheme.primary}66`,
              }}
            >
              {renderSettings()}
            </div>
          )}
        </section>
      </div>

      {/* RESPONSIVE CSS */}
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