"use client";

import { useState } from "react";
import TicTacToeBoard from "./components/TicTacToeBoard";

type SymbolType = "X" | "O";
type ThemeType = "blue" | "orange" | "purple" | "green";

export default function TicTacToePage() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [turn, setTurn] = useState<SymbolType>("X");

  const [theme, setTheme] = useState<ThemeType>("blue");

  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");

  // Player 1 chooses X or O.
  // Player 2 automatically gets the opposite.
  const [player1Symbol, setPlayer1Symbol] =
    useState<SymbolType>("X");

  const player2Symbol: SymbolType =
    player1Symbol === "X" ? "O" : "X";

  const [score, setScore] = useState({
    X: 0,
    O: 0,
    draw: 0,
  });

  const [winner, setWinner] = useState<SymbolType | "draw" | null>(
    null
  );

  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const currentTheme = themes[theme];

  function getPlayerName(symbol: SymbolType) {
    return symbol === player1Symbol
      ? player1Name
      : player2Name;
  }

  function play(index: number) {
    if (board[index] !== "" || winner !== null) return;

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

    const hasWinner = winningLines.some(([a, b, c]) => {
      return (
        newBoard[a] !== "" &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      );
    });

    setBoard(newBoard);

    if (hasWinner) {
      setWinner(turn);

      setScore((prev) => ({
        ...prev,
        [turn]: prev[turn] + 1,
      }));

      return;
    }

    const isDraw = newBoard.every((cell) => cell !== "");

    if (isDraw) {
      setWinner("draw");

      setScore((prev) => ({
        ...prev,
        draw: prev.draw + 1,
      }));

      return;
    }

    setTurn(turn === "X" ? "O" : "X");
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

  function changePlayer1Symbol(symbol: SymbolType) {
    setPlayer1Symbol(symbol);

    setBoard(Array(9).fill(""));
    setWinner(null);
    setTurn(symbol);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: currentTheme.background,
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {/* TITLE */}

      <h1
        style={{
          margin: 0,
          color: currentTheme.primary,
          textAlign: "center",
        }}
      >
        🎮 TIC TAC TOE
      </h1>

      {/* TURN CARD */}

      {!winner && (
        <div
          style={{
            width: "min(90vw, 500px)",
            boxSizing: "border-box",
            padding: "14px 20px",
            borderRadius: "16px",
            textAlign: "center",
            background: "#111722",
            border: `2px solid ${currentTheme.primary}`,
            boxShadow: `0 0 18px ${currentTheme.primary}55`,
          }}
        >
          <div
            style={{
              fontSize: "14px",
              opacity: 0.7,
              marginBottom: "4px",
            }}
          >
            CURRENT TURN
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: "bold",
              color: currentTheme.primary,
            }}
          >
            {turn === "X" ? "❌" : "⭕"}{" "}
            {getPlayerName(turn)}'s Turn
          </div>
        </div>
      )}

      {/* SCORE CARD */}

      <div
        style={{
          width: "min(90vw, 500px)",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        {/* PLAYER 1 */}

        <div
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "14px",
            textAlign: "center",
            background: "#111722",
            border:
              turn === player1Symbol && !winner
                ? `2px solid ${currentTheme.primary}`
                : "2px solid #303642",
          }}
        >
          <div style={{ fontSize: "13px", opacity: 0.7 }}>
            {player1Symbol === "X" ? "❌" : "⭕"}
          </div>

          <div
            style={{
              fontWeight: "bold",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {player1Name}
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: currentTheme.primary,
            }}
          >
            {score[player1Symbol]}
          </div>

          <div style={{ fontSize: "11px", opacity: 0.6 }}>
            WINS
          </div>
        </div>

        {/* DRAWS */}

        <div
          style={{
            width: "70px",
            padding: "12px 5px",
            borderRadius: "14px",
            textAlign: "center",
            background: "#111722",
            border: "2px solid #303642",
          }}
        >
          <div style={{ fontSize: "13px", opacity: 0.7 }}>
            🤝
          </div>

          <div
            style={{
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            {score.draw}
          </div>

          <div style={{ fontSize: "11px", opacity: 0.6 }}>
            DRAWS
          </div>
        </div>

        {/* PLAYER 2 */}

        <div
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "14px",
            textAlign: "center",
            background: "#111722",
            border:
              turn === player2Symbol && !winner
                ? `2px solid ${currentTheme.secondary}`
                : "2px solid #303642",
          }}
        >
          <div style={{ fontSize: "13px", opacity: 0.7 }}>
            {player2Symbol === "X" ? "❌" : "⭕"}
          </div>

          <div
            style={{
              fontWeight: "bold",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {player2Name}
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: currentTheme.secondary,
            }}
          >
            {score[player2Symbol]}
          </div>

          <div style={{ fontSize: "11px", opacity: 0.6 }}>
            WINS
          </div>
        </div>
      </div>

      {/* BOARD */}

      <TicTacToeBoard
        board={board}
        play={play}
        theme={currentTheme}
      />

      {/* WINNER / DRAW CARD */}

      {winner && (
        <div
          style={{
            width: "min(90vw, 500px)",
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
              <div style={{ fontSize: "32px" }}>🤝</div>

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                IT'S A DRAW!
              </div>

              <div style={{ opacity: 0.7 }}>
                Nobody wins this round.
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "34px" }}>🏆</div>

              <div
                style={{
                  fontSize: "26px",
                  fontWeight: "bold",
                  color: currentTheme.primary,
                }}
              >
                {getPlayerName(winner)} WINS!
              </div>

              <div style={{ opacity: 0.7 }}>
                {winner === "X" ? "❌ X" : "⭕ O"} completed
                the winning line.
              </div>
            </>
          )}
        </div>
      )}

      {/* CONTROLS */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={restart}
          style={{
            padding: "11px 18px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          🔄 Restart
        </button>

        <button
          onClick={newGame}
          style={{
            padding: "11px 18px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          🆕 New Game
        </button>

        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          style={{
            padding: "11px 18px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* SETTINGS */}

      {settingsOpen && (
        <div
          style={{
            width: "min(90vw, 500px)",
            padding: "20px",
            boxSizing: "border-box",
            borderRadius: "18px",
            background: "#111722",
            border: `2px solid ${currentTheme.primary}`,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: currentTheme.primary,
            }}
          >
            ⚙️ Game Settings
          </h2>

          {/* PLAYER 1 */}

          <div style={{ marginBottom: "16px" }}>
            <label>
              Player 1 Name
            </label>

            <input
              value={player1Name}
              onChange={(e) =>
                setPlayer1Name(e.target.value)
              }
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                marginTop: "6px",
                padding: "10px",
                borderRadius: "8px",
              }}
            />
          </div>

          {/* PLAYER 2 */}

          <div style={{ marginBottom: "16px" }}>
            <label>
              Player 2 Name
            </label>

            <input
              value={player2Name}
              onChange={(e) =>
                setPlayer2Name(e.target.value)
              }
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                marginTop: "6px",
                padding: "10px",
                borderRadius: "8px",
              }}
            />
          </div>

          {/* SYMBOL */}

          <div style={{ marginBottom: "16px" }}>
            <div style={{ marginBottom: "8px" }}>
              Player 1 Symbol
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                onClick={() =>
                  changePlayer1Symbol("X")
                }
                style={{
                  flex: 1,
                  padding: "12px",
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
                }}
              >
                ❌ X
              </button>

              <button
                onClick={() =>
                  changePlayer1Symbol("O")
                }
                style={{
                  flex: 1,
                  padding: "12px",
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
                }}
              >
                ⭕ O
              </button>
            </div>

            <div
              style={{
                marginTop: "8px",
                opacity: 0.7,
                fontSize: "13px",
              }}
            >
              {player1Name}: {player1Symbol} &nbsp; | &nbsp;
              {player2Name}: {player2Symbol}
            </div>
          </div>

          {/* THEME */}

          <div>
            <div style={{ marginBottom: "8px" }}>
              Theme
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button onClick={() => setTheme("blue")}>
                🔵
              </button>

              <button onClick={() => setTheme("orange")}>
                🟠
              </button>

              <button onClick={() => setTheme("purple")}>
                🟣
              </button>

              <button onClick={() => setTheme("green")}>
                🟢
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}