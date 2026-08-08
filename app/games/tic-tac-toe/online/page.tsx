"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import TicTacToeBoard from "../components/TicTacToeBoard";

type SymbolType = "X" | "O";
type ThemeType = "blue" | "orange" | "purple" | "green";

type Theme = {
  primary: string;
  secondary: string;
  background: string;
};

type Player = {
  name: string;
  symbol: SymbolType;
  wins: number;
};

type GameState = {
  board: string[];
  turn: SymbolType;
  player1: Player | null;
  player2: Player | null;
  winner: SymbolType | "draw" | null;
  player1Ready: boolean;
  player2Ready: boolean;
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

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

const emptyState: GameState = {
  board: Array(9).fill(""),
  turn: "X",
  player1: null,
  player2: null,
  winner: null,
  player1Ready: false,
  player2Ready: false,
};

export default function OnlineTicTacToePage() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const [gameState, setGameState] =
    useState<GameState>(emptyState);

  const [role, setRole] =
    useState<"player1" | "player2" | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [themeName, setThemeName] =
    useState<ThemeType>("blue");

  const theme = themes[themeName];

  const mySymbol: SymbolType | null =
    role === "player1"
      ? "X"
      : role === "player2"
      ? "O"
      : null;

  /*
   * =========================
   * CREATE ROOM
   * =========================
   */

  async function createRoom() {
    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let code = generateRoomCode();

      let exists = true;

      while (exists) {
        const { data } = await supabase
          .from("game_rooms")
          .select("room_code")
          .eq("room_code", code)
          .eq("game", "tic-tac-toe")
          .maybeSingle();

        exists = !!data;

        if (exists) {
          code = generateRoomCode();
        }
      }

      const initialState: GameState = {
        board: Array(9).fill(""),
        turn: "X",

        player1: {
          name: name.trim(),
          symbol: "X",
          wins: 0,
        },

        player2: null,

        winner: null,

        player1Ready: false,
        player2Ready: false,
      };

      const { error } = await supabase
        .from("game_rooms")
        .insert({
          room_code: code,
          game: "tic-tac-toe",
          state: initialState,
        });

      if (error) {
        console.error(error);
        setMessage("Could not create room.");
        return;
      }

      setRoomCode(code);
      setGameState(initialState);
      setRole("player1");
      setInGame(true);

      setMessage(
        "Room created! Waiting for opponent..."
      );
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================
   * JOIN ROOM
   * =========================
   */

  async function joinRoom() {
    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!roomCode.trim()) {
      setMessage("Please enter a room code.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const code = roomCode.trim().toUpperCase();

      const { data, error } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("room_code", code)
        .eq("game", "tic-tac-toe")
        .maybeSingle();

      if (error || !data) {
        setMessage("Room not found.");
        return;
      }

      const currentState =
        data.state as GameState;

      if (currentState.player2 !== null) {
        setMessage(
          "This room already has two players."
        );
        return;
      }

      const updatedState: GameState = {
        ...currentState,

        player2: {
          name: name.trim(),
          symbol: "O",
          wins: 0,
        },
      };

      const { error: updateError } =
        await supabase
          .from("game_rooms")
          .update({
            state: updatedState,
          })
          .eq("room_code", code)
          .eq("game", "tic-tac-toe");

      if (updateError) {
        console.error(updateError);
        setMessage("Could not join room.");
        return;
      }

      setRoomCode(code);
      setGameState(updatedState);
      setRole("player2");
      setInGame(true);
      setMessage("Joined successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================
   * POLL ROOM STATE
   * =========================
   */

  useEffect(() => {
  if (!inGame || !roomCode) return;

  let active = true;

  const loadGame = async () => {
    const { data, error } = await supabase
      .from("game_rooms")
      .select("state")
      .eq(
        "room_code",
        roomCode.trim().toUpperCase()
      )
      .eq("game", "tic-tac-toe")
      .maybeSingle();

    if (error) {
      console.error("Room sync error:", error);
      return;
    }

    if (!data || !active) return;

    const nextState = data.state as GameState;

    setGameState(nextState);
  };

  loadGame();

  const interval = window.setInterval(
    loadGame,
    500
  );

  return () => {
    active = false;
    window.clearInterval(interval);
  };
}, [inGame, roomCode]);

  /*
   * =========================
   * PLAY MOVE
   * =========================
   */

  async function play(index: number) {
    if (!role || !mySymbol) return;

    if (!gameState.player2) {
      setMessage(
        "Waiting for your opponent to join..."
      );
      return;
    }

    if (gameState.board[index] !== "") return;

    if (gameState.winner !== null) return;

    if (gameState.turn !== mySymbol) {
      setMessage("Wait for your turn!");
      return;
    }

    const { data, error } = await supabase
      .from("game_rooms")
      .select("state")
      .eq("room_code", roomCode)
      .eq("game", "tic-tac-toe")
      .maybeSingle();

    if (error || !data) return;

    const latest =
      data.state as GameState;

    if (!latest.player2) return;
    if (latest.turn !== mySymbol) return;
    if (latest.board[index] !== "") return;
    if (latest.winner !== null) return;

    const newBoard = [...latest.board];

    newBoard[index] = mySymbol;

    const hasWinner = winningLines.some(
      ([a, b, c]) => {
        return (
          newBoard[a] !== "" &&
          newBoard[a] === newBoard[b] &&
          newBoard[a] === newBoard[c]
        );
      }
    );

    const isDraw =
      !hasWinner &&
      newBoard.every(
        (cell) => cell !== ""
      );

    let newWinner:
      | SymbolType
      | "draw"
      | null = null;

    if (hasWinner) {
      newWinner = mySymbol;
    } else if (isDraw) {
      newWinner = "draw";
    }

    const updatedState: GameState = {
      ...latest,

      board: newBoard,

      turn:
        newWinner !== null
          ? latest.turn
          : mySymbol === "X"
          ? "O"
          : "X",

      winner: newWinner,
    };

    /*
     * Update winner's score.
     */

    if (
      newWinner === "X" ||
      newWinner === "O"
    ) {
      if (
        updatedState.player1?.symbol ===
        newWinner
      ) {
        updatedState.player1 = {
          ...updatedState.player1,
          wins:
            updatedState.player1.wins + 1,
        };
      }

      if (
        updatedState.player2?.symbol ===
        newWinner
      ) {
        updatedState.player2 = {
          ...updatedState.player2,
          wins:
            updatedState.player2.wins + 1,
        };
      }
    }

    const {
      error: updateError,
    } = await supabase
      .from("game_rooms")
      .update({
        state: updatedState,
      })
      .eq("room_code", roomCode)
      .eq("game", "tic-tac-toe");

    if (updateError) {
      console.error(updateError);
      return;
    }

    setGameState(updatedState);

if (newWinner === "X") {
  setMessage(
    `🏆 ${updatedState.player1?.name || "Player 1"} wins!`
  );
} else if (newWinner === "O") {
  setMessage(
    `🏆 ${updatedState.player2?.name || "Player 2"} wins!`
  );
} else if (newWinner === "draw") {
  setMessage("🤝 It's a draw!");
} else {
  setMessage("");
}
  }

  /*
   * =========================
   * RESTART / NEXT ROUND
   * =========================
   */

  async function restart() {
  if (!roomCode || !role) return;

  const { data, error } = await supabase
    .from("game_rooms")
    .select("state")
    .eq("room_code", roomCode)
    .eq("game", "tic-tac-toe")
    .maybeSingle();

  if (error || !data) return;

  const latest = data.state as GameState;

  const updatedState: GameState = {
    ...latest,
    player1Ready:
      role === "player1"
        ? true
        : latest.player1Ready,
    player2Ready:
      role === "player2"
        ? true
        : latest.player2Ready,
  };

  // BOTH PLAYERS READY → START NEW ROUND
  if (
    updatedState.player1Ready &&
    updatedState.player2Ready
  ) {
    updatedState.board = Array(9).fill("");
    updatedState.turn = "X";
    updatedState.winner = null;
    updatedState.player1Ready = false;
    updatedState.player2Ready = false;
  }

  const { error: updateError } = await supabase
    .from("game_rooms")
    .update({
      state: updatedState,
    })
    .eq("room_code", roomCode)
    .eq("game", "tic-tac-toe");

  if (updateError) {
    console.error(updateError);
    return;
  }

  setGameState(updatedState);

  // If BOTH players clicked → new round
  if (
    updatedState.winner === null &&
    !updatedState.player1Ready &&
    !updatedState.player2Ready
  ) {
    setMessage("🔥 New Round!");
  } else {
    setMessage("⏳ Waiting for the other player...");
  }
}

  /*
   * =========================
   * LEAVE GAME
   * =========================
   */

  async function leaveGame() {
    if (!roomCode || !role) return;

    const { data } = await supabase
      .from("game_rooms")
      .select("state")
      .eq("room_code", roomCode)
      .eq("game", "tic-tac-toe")
      .maybeSingle();

    if (data) {
      const state =
        data.state as GameState;

      const updatedState: GameState = {
        ...state,

        player1:
          role === "player1"
            ? null
            : state.player1,

        player2:
          role === "player2"
            ? null
            : state.player2,

        player1Ready: false,
        player2Ready: false,

        board: Array(9).fill(""),
        winner: null,
        turn: "X",
      };

      await supabase
        .from("game_rooms")
        .update({
          state: updatedState,
        })
        .eq("room_code", roomCode)
        .eq("game", "tic-tac-toe");
    }

    setInGame(false);
    setRole(null);
    setRoomCode("");
    setGameState(emptyState);
    setMessage("");
  }

  /*
   * =========================
   * NEW GAME
   * =========================
   */

  async function newGame() {
    await leaveGame();
  }

  /*
   * =========================
   * SCOREBOARD
   * =========================
   */

  function renderScoreboard() {
    const player1 =
      gameState.player1;

    const player2 =
      gameState.player2;

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
              gameState.turn === "X" &&
              gameState.winner === null
                ? `2px solid ${theme.primary}`
                : "2px solid #303642",
            boxShadow:
              gameState.turn === "X" &&
              gameState.winner === null
                ? `0 0 14px ${theme.primary}22`
                : "none",
          }}
        >
          <div style={{ fontSize: "20px" }}>
            ❌
          </div>

          <strong>
            {player1?.name || "Player 1"}
          </strong>

          <div
            style={{
              fontSize: "25px",
              color: theme.primary,
              fontWeight: "bold",
              marginTop: "3px",
            }}
          >
            {player1?.wins || 0}
          </div>
        </div>

        <div
          style={{
            padding: "12px",
            borderRadius: "14px",
            background: "#111722",
            textAlign: "center",
            border:
              gameState.turn === "O" &&
              gameState.winner === null
                ? `2px solid ${theme.secondary}`
                : "2px solid #303642",
            boxShadow:
              gameState.turn === "O" &&
              gameState.winner === null
                ? `0 0 14px ${theme.secondary}22`
                : "none",
          }}
        >
          <div style={{ fontSize: "20px" }}>
            ⭕
          </div>

          <strong>
            {player2?.name || "Waiting..."}
          </strong>

          <div
            style={{
              fontSize: "25px",
              color: theme.secondary,
              fontWeight: "bold",
              marginTop: "3px",
            }}
          >
            {player2?.wins || 0}
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================
   * STATUS
   * =========================
   */

  function renderStatus() {
    let text = "";

    if (!gameState.player2) {
      text = "⏳ Waiting for opponent...";
    } else if (gameState.winner === "draw") {
      text = "🤝 IT'S A DRAW!";
    } else if (gameState.winner === "X") {
      text =
        `🏆 ${gameState.player1?.name || "Player 1"} WINS!`;
    } else if (gameState.winner === "O") {
      text =
        `🏆 ${gameState.player2?.name || "Player 2"} WINS!`;
    } else if (gameState.turn === mySymbol) {
      text =
        mySymbol === "X"
          ? "❌ YOUR TURN"
          : "⭕ YOUR TURN";
    } else {
      text =
        gameState.turn === "X"
          ? `❌ ${gameState.player1?.name || "Player 1"}'S TURN`
          : `⭕ ${gameState.player2?.name || "Player 2"}'S TURN`;
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
        {text}
      </div>
    );
  }

  /*
   * =========================
   * RESULT CARD
   * =========================
   */

  function renderResult() {
    if (!gameState.winner) return null;

    const isDraw =
      gameState.winner === "draw";

    const winnerName =
      gameState.winner === "X"
        ? gameState.player1?.name ||
          "Player 1"
        : gameState.player2?.name ||
          "Player 2";

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
            isDraw
              ? "#ffffff"
              : theme.primary
          }`,
          boxShadow: `0 0 25px ${
            isDraw
              ? "#ffffff33"
              : theme.primary + "44"
          }`,
        }}
      >
        <div style={{ fontSize: "34px" }}>
          {isDraw ? "🤝" : "🏆"}
        </div>

        <div
          style={{
            marginTop: "4px",
            fontSize: "24px",
            fontWeight: "bold",
            color: isDraw
              ? "white"
              : theme.primary,
          }}
        >
          {isDraw
            ? "IT'S A DRAW!"
            : `${winnerName} WINS!`}
        </div>

        <div
          style={{
            marginTop: "5px",
            opacity: 0.7,
            fontSize: "13px",
          }}
        >
          {isDraw
            ? "Nobody wins this round."
            : "Winning line completed."}
        </div>
      </div>
    );
  }

  /*
   * =========================
   * ACTION BUTTONS
   * =========================
   */

  function renderActionButtons() {
  const myReady =
    role === "player1"
      ? gameState.player1Ready
      : role === "player2"
      ? gameState.player2Ready
      : false;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "10px",
      }}
    >
      <button
        onClick={restart}
        disabled={
          !gameState.winner ||
          !gameState.player2 ||
          myReady
        }
        style={{
          padding: "11px 12px",
          borderRadius: "10px",
          cursor:
            gameState.winner &&
            gameState.player2 &&
            !myReady
              ? "pointer"
              : "not-allowed",
          border: `2px solid ${theme.primary}`,
          background: `${theme.primary}22`,
          color: "white",
          fontWeight: "bold",
          boxShadow: `0 0 12px ${theme.primary}33`,
          opacity:
            gameState.winner &&
            gameState.player2 &&
            !myReady
              ? 1
              : 0.45,
        }}
      >
        {myReady
          ? "⏳ Waiting..."
          : "🔄 Restart"}
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

  /*
   * =========================
   * SETTINGS
   * =========================
   */

  function renderSettings() {
    return (
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
          ).map(([themeKey, emoji]) => (
            <button
              key={themeKey}
              onClick={() =>
                setThemeName(themeKey)
              }
              style={{
                padding: "10px 4px",
                borderRadius: "10px",
                cursor: "pointer",
                border:
                  themeName === themeKey
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

        <div
          style={{
            marginTop: "16px",
            paddingTop: "14px",
            borderTop:
              "1px solid #303642",
            fontSize: "13px",
            opacity: 0.7,
            lineHeight: 1.6,
          }}
        >
          <strong>Room Code</strong>

          <div
            style={{
              marginTop: "5px",
              fontSize: "20px",
              letterSpacing: "4px",
              color: theme.primary,
              fontWeight: "bold",
            }}
          >
            {roomCode}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "8px",
            marginTop: "12px",
          }}
        >
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(
                roomCode
              );
              setMessage(
                "📋 Room code copied!"
              );
            }}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: `1px solid ${theme.primary}`,
              background: "#17202e",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📋 Copy
          </button>

          <button
            onClick={async () => {
              const text =
                `Join my Gamifilo Tic Tac Toe game! Room Code: ${roomCode}`;

              try {
                if (
                  navigator.share
                ) {
                  await navigator.share({
                    title:
                      "Gamifilo Tic Tac Toe",
                    text,
                  });
                } else {
                  await navigator.clipboard.writeText(
                    text
                  );

                  setMessage(
                    "🔗 Invite copied!"
                  );
                }
              } catch {
                // User cancelled share.
              }
            }}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: `1px solid ${theme.secondary}`,
              background: "#17202e",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🔗 Share
          </button>
        </div>
      </div>
    );
  }

  /*
   * =========================
   * GAME SCREEN
   * =========================
   */

  if (inGame) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: theme.background,
          color: "white",
          padding:
            "24px 16px 40px",
          boxSizing: "border-box",
        }}
      >
        <header
          style={{
            width: "100%",
            maxWidth: "1100px",
            margin:
              "0 auto 24px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: theme.primary,
              fontSize:
                "clamp(26px, 5vw, 40px)",
              fontWeight: 900,
              letterSpacing:
                "0.02em",
            }}
          >
            🎮 TIC TAC TOE
          </h1>

          <p
            style={{
              margin:
                "7px 0 0",
              fontSize: "13px",
              opacity: 0.6,
            }}
          >
            Online Multiplayer
          </p>
        </header>

        {/* DESKTOP */}

        <div className="ttt-online-desktop">
          <div
            style={{
              width:
                "min(1100px, 100%)",
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
                flexDirection:
                  "column",
                alignItems:
                  "center",
                gap: "18px",
                minWidth: 0,
              }}
            >
              {renderStatus()}

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent:
                    "center",
                }}
              >
                <TicTacToeBoard
                  board={
                    gameState.board
                  }
                  play={play}
                  theme={theme}
                />
              </div>

              {renderResult()}
            </section>

            {/* RIGHT */}

            <aside
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: "14px",
              }}
            >
              {/* SCOREBOARD */}

              <div
                style={{
                  background:
                    "#111722",
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
                  background:
                    "#111722",
                  border: `2px solid ${theme.primary}55`,
                  borderRadius: "18px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    marginBottom:
                      "12px",
                    color:
                      theme.primary,
                    fontSize:
                      "17px",
                    fontWeight:
                      "bold",
                  }}
                >
                  🎮 Game Controls
                </div>

                {renderActionButtons()}
              </div>

              {/* SETTINGS */}

              <div
                style={{
                  background:
                    "#111722",
                  border: `2px solid ${theme.primary}55`,
                  borderRadius: "18px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    marginBottom:
                      "16px",
                    color:
                      theme.primary,
                    fontSize:
                      "17px",
                    fontWeight:
                      "bold",
                  }}
                >
                  ⚙️ Game Settings
                </div>

                {renderSettings()}
              </div>

              {/* MESSAGE */}

              {message && (
                <div
                  style={{
                    padding:
                      "10px 12px",
                    borderRadius:
                      "10px",
                    background:
                      "#111722",
                    textAlign:
                      "center",
                    color:
                      theme.secondary,
                    fontSize:
                      "13px",
                  }}
                >
                  {message}
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* MOBILE */}

        <div className="ttt-online-mobile">
          <section
            style={{
              width:
                "min(560px, 100%)",
              margin: "0 auto",
              display: "flex",
              flexDirection:
                "column",
              alignItems:
                "center",
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

            {/* STATUS */}

            <div
              style={{
                width: "100%",
              }}
            >
              {renderStatus()}
            </div>

            {/* BOARD */}

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent:
                  "center",
              }}
            >
              <TicTacToeBoard
                board={
                  gameState.board
                }
                play={play}
                theme={theme}
              />
            </div>

            {/* RESULT */}

            {renderResult()}

            {/* CONTROLS */}

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
                setSettingsOpen(
                  !settingsOpen
                )
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
                  boxSizing:
                    "border-box",
                  borderRadius:
                    "18px",
                  background:
                    "#111722",
                  border: `2px solid ${theme.primary}66`,
                }}
              >
                {renderSettings()}
              </div>
            )}

            {/* MESSAGE */}

            {message && (
              <div
                style={{
                  width: "100%",
                  padding:
                    "10px 12px",
                  boxSizing:
                    "border-box",
                  borderRadius:
                    "10px",
                  background:
                    "#111722",
                  textAlign:
                    "center",
                  color:
                    theme.secondary,
                  fontSize:
                    "13px",
                }}
              >
                {message}
              </div>
            )}
          </section>
        </div>

        <style jsx>{`
          .ttt-online-desktop {
            display: block;
          }

          .ttt-online-mobile {
            display: none;
          }

          @media (max-width: 800px) {
            .ttt-online-desktop {
              display: none;
            }

            .ttt-online-mobile {
              display: block;
            }
          }
        `}</style>
      </main>
    );
  }

  /*
   * =========================
   * CREATE / JOIN SCREEN
   * =========================
   */

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          theme.background,
        color: "white",
        padding:
          "24px 16px 40px",
        boxSizing:
          "border-box",
      }}
    >
      <div
        style={{
          width:
            "min(500px, 100%)",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            textAlign: "center",
            marginBottom:
              "28px",
          }}
        >
          <h1
            style={{
              margin: 0,
              color:
                theme.primary,
              fontSize:
                "clamp(28px, 7vw, 40px)",
              fontWeight: 900,
            }}
          >
            🎮 TIC TAC TOE
          </h1>

          <p
            style={{
              margin:
                "7px 0 0",
              fontSize: "14px",
              opacity: 0.65,
            }}
          >
            🌐 Online Multiplayer
          </p>
        </header>

        <div
          style={{
            background:
              "#111722",
            border: `2px solid ${theme.primary}55`,
            borderRadius:
              "20px",
            padding: "20px",
          }}
        >
          {/* NAME */}

          <div
            style={{
              marginBottom:
                "18px",
            }}
          >
            <label
              style={{
                display:
                  "block",
                marginBottom:
                  "7px",
                fontSize:
                  "13px",
                fontWeight:
                  "bold",
              }}
            >
              Your Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Enter your name"
              maxLength={20}
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding:
                  "13px",
                borderRadius:
                  "10px",
                background:
                  "#080b16",
                color:
                  "white",
                border:
                  "1px solid #3b4352",
                fontSize:
                  "16px",
                outline:
                  "none",
              }}
            />
          </div>

          {/* CREATE */}

          <button
            onClick={createRoom}
            disabled={loading}
            style={{
              width: "100%",
              padding:
                "14px",
              borderRadius:
                "12px",
              border: "none",
              background:
                theme.primary,
              color: "#000",
              fontSize:
                "16px",
              fontWeight:
                "bold",
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              opacity:
                loading
                  ? 0.6
                  : 1,
            }}
          >
            🎮{" "}
            {loading
              ? "Creating..."
              : "Create Room"}
          </button>

          <div
            style={{
              textAlign:
                "center",
              margin:
                "18px 0",
              opacity: 0.5,
              fontSize:
                "13px",
            }}
          >
            — OR —
          </div>

          {/* ROOM CODE */}

          <div
            style={{
              marginBottom:
                "12px",
            }}
          >
            <label
              style={{
                display:
                  "block",
                marginBottom:
                  "7px",
                fontSize:
                  "13px",
                fontWeight:
                  "bold",
              }}
            >
              Room Code
            </label>

            <input
              value={roomCode}
              onChange={(e) =>
                setRoomCode(
                  e.target.value
                    .toUpperCase()
                )
              }
              placeholder="ABC123"
              maxLength={6}
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding:
                  "13px",
                borderRadius:
                  "10px",
                background:
                  "#080b16",
                color:
                  "white",
                border:
                  "1px solid #3b4352",
                fontSize:
                  "20px",
                textAlign:
                  "center",
                letterSpacing:
                  "5px",
                outline:
                  "none",
              }}
            />
          </div>

          {/* JOIN */}

          <button
            onClick={joinRoom}
            disabled={loading}
            style={{
              width: "100%",
              padding:
                "14px",
              borderRadius:
                "12px",
              border: `2px solid ${theme.secondary}`,
              background:
                `${theme.secondary}18`,
              color:
                "white",
              fontSize:
                "16px",
              fontWeight:
                "bold",
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              opacity:
                loading
                  ? 0.6
                  : 1,
            }}
          >
            🚀{" "}
            {loading
              ? "Joining..."
              : "Join Room"}
          </button>
        </div>

        {/* THEME */}

        <div
          style={{
            marginTop:
              "16px",
            background:
              "#111722",
            border: `2px solid ${theme.primary}44`,
            borderRadius:
              "18px",
            padding:
              "16px",
          }}
        >
          <div
            style={{
              marginBottom:
                "10px",
              color:
                theme.primary,
              fontWeight:
                "bold",
              fontSize:
                "14px",
            }}
          >
            ⚙️ Theme
          </div>

          <div
            style={{
              display:
                "grid",
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
              ] as [
                ThemeType,
                string
              ][]
            ).map(
              ([
                themeKey,
                emoji,
              ]) => (
                <button
                  key={
                    themeKey
                  }
                  onClick={() =>
                    setThemeName(
                      themeKey
                    )
                  }
                  style={{
                    padding:
                      "10px",
                    borderRadius:
                      "10px",
                    cursor:
                      "pointer",
                    border:
                      themeName ===
                      themeKey
                        ? `2px solid ${theme.primary}`
                        : "1px solid #3b4352",
                    background:
                      "#17202e",
                    color:
                      "white",
                    fontSize:
                      "18px",
                  }}
                >
                  {emoji}
                </button>
              )
            )}
          </div>
        </div>

        {message && (
          <div
            style={{
              marginTop:
                "14px",
              padding:
                "11px",
              borderRadius:
                "10px",
              background:
                "#111722",
              textAlign:
                "center",
              color:
                theme.secondary,
              fontSize:
                "13px",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </main>
  );
}