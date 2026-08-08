"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import TicTacToeBoard from "../components/TicTacToeBoard";

type SymbolType = "X" | "O";

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

  const [gameState, setGameState] = useState<GameState>(emptyState);

  const [role, setRole] = useState<"player1" | "player2" | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [inGame, setInGame] = useState(false);

  const [theme] = useState({
    primary: "#00bfff",
    secondary: "#00e5ff",
    background: "#080b16",
  });

  const mySymbol: SymbolType | null =
    role === "player1"
      ? "X"
      : role === "player2"
      ? "O"
      : null;

  /*
   * CREATE ROOM
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

      setMessage("Room created! Waiting for opponent...");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  /*
   * JOIN ROOM
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

      const currentState = data.state as GameState;

      if (currentState.player2 !== null) {
        setMessage("This room already has two players.");
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

      const { error: updateError } = await supabase
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
   * POLL ROOM STATE
   */
  useEffect(() => {
  if (!inGame || !roomCode) return;

  const loadGame = async () => {
    const { data, error } = await supabase
      .from("game_rooms")
      .select("state")
      .eq("room_code", roomCode.trim().toUpperCase())
      .eq("game", "tic-tac-toe")
      .maybeSingle();

    if (error) {
      console.error("Room sync error:", error);
      return;
    }

    if (!data) return;

    const nextState = data.state as GameState;

if (
  nextState.winner &&
  nextState.player1Ready &&
  nextState.player2Ready
) {
  const newRoundState: GameState = {
    ...nextState,
    board: Array(9).fill(""),
    turn: "X",
    winner: null,
    player1Ready: false,
    player2Ready: false,
  };

  await supabase
    .from("game_rooms")
    .update({
      state: newRoundState,
    })
    .eq("room_code", roomCode)
    .eq("game", "tic-tac-toe");

  setGameState(newRoundState);
  setMessage("🔥 New Round!");
} else {
  setGameState(nextState);
}
  };

  // Load immediately
  loadGame();

  // Keep checking for opponent/moves
  const interval = window.setInterval(() => {
    loadGame();
  }, 500);

  return () => {
    window.clearInterval(interval);
  };
}, [inGame, roomCode]);

  /*
   * PLAY MOVE
   */
  async function play(index: number) {
    if (!role || !mySymbol) return;

    if (gameState.board[index] !== "") return;

    if (gameState.winner !== null) return;

    if (!gameState.player2) {
      setMessage("Waiting for your opponent to join...");
      return;
    }

    if (gameState.turn !== mySymbol) {
      setMessage("Wait for your turn!");
      return;
    }

    /*
     * Get freshest state before making move.
     */
    const { data, error } = await supabase
      .from("game_rooms")
      .select("state")
      .eq("room_code", roomCode)
      .eq("game", "tic-tac-toe")
      .maybeSingle();

    if (error || !data) return;

    const latest = data.state as GameState;

    if (latest.turn !== mySymbol) return;
    if (latest.board[index] !== "") return;
    if (latest.winner !== null) return;

    const newBoard = [...latest.board];

    newBoard[index] = mySymbol;

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

    const isDraw =
      !hasWinner &&
      newBoard.every((cell) => cell !== "");

    let newWinner: SymbolType | "draw" | null = null;

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
     * Update score when somebody wins.
     */
    if (newWinner === "X" || newWinner === "O") {
      if (updatedState.player1?.symbol === newWinner) {
        updatedState.player1 = {
          ...updatedState.player1,
          wins: updatedState.player1.wins + 1,
        };
      }

      if (updatedState.player2?.symbol === newWinner) {
        updatedState.player2 = {
          ...updatedState.player2,
          wins: updatedState.player2.wins + 1,
        };
      }
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
  }

  /*
   * NEW ROUND
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

  // BOTH PLAYERS READY → NEW ROUND
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

  if (updatedState.winner === null) {
    setMessage("");
  } else {
    setMessage("Waiting for the other player...");
  }
}

/*
 * LEAVE GAME
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
    const state = data.state as GameState;

    const updatedState: GameState = {
      ...state,
      player1:
        role === "player1" ? null : state.player1,
      player2:
        role === "player2" ? null : state.player2,
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
   * GAME SCREEN
   */
  if (inGame) {
    const player1 = gameState.player1;
    const player2 = gameState.player2;

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
          🎮 TIC TAC TOE
        </h1>

        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  }}
>
  <div
    style={{
      padding: "8px 18px",
      borderRadius: "12px",
      background: "#111722",
      border: `1px solid ${theme.primary}`,
    }}
  >
    ROOM:{" "}
    <strong style={{ color: theme.primary }}>
      {roomCode}
    </strong>
  </div>

  <button
    onClick={async () => {
      await navigator.clipboard.writeText(roomCode);
      setMessage("📋 Room code copied!");
    }}
    style={{
      padding: "9px 14px",
      borderRadius: "10px",
      border: `1px solid ${theme.primary}`,
      background: "#111722",
      color: "white",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    📋 Copy
  </button>

  <button
    onClick={async () => {
      const text = `Join my Gamifilo Tic Tac Toe game! Room Code: ${roomCode}`;

      if (navigator.share) {
        await navigator.share({
          title: "Gamifilo Tic Tac Toe",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setMessage("🔗 Invite copied!");
      }
    }}
    style={{
      padding: "9px 14px",
      borderRadius: "10px",
      border: `1px solid ${theme.secondary}`,
      background: "#111722",
      color: "white",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    🔗 Share
  </button>
</div>

        {/* PLAYERS */}

        <div
          style={{
            width: "min(90vw, 500px)",
            display: "flex",
            gap: "10px",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "14px",
              textAlign: "center",
              background: "#111722",
              border:
                gameState.turn === "X"
                  ? `2px solid ${theme.primary}`
                  : "2px solid #303642",
            }}
          >
            <div>❌</div>

            <strong>
              {player1?.name || "Player 1"}
            </strong>

            <div
              style={{
                fontSize: "26px",
                color: theme.primary,
                fontWeight: "bold",
              }}
            >
              {player1?.wins || 0}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "14px",
              textAlign: "center",
              background: "#111722",
              border:
                gameState.turn === "O"
                  ? `2px solid ${theme.secondary}`
                  : "2px solid #303642",
            }}
          >
            <div>⭕</div>

            <strong>
              {player2?.name || "Waiting..."}
            </strong>

            <div
              style={{
                fontSize: "26px",
                color: theme.secondary,
                fontWeight: "bold",
              }}
            >
              {player2?.wins || 0}
            </div>
          </div>
        </div>

        {/* TURN / WAITING */}

        {!player2 ? (
          <div
            style={{
              padding: "15px 25px",
              borderRadius: "15px",
              background: "#111722",
              border: `2px solid ${theme.primary}`,
              textAlign: "center",
            }}
          >
            ⏳ Waiting for opponent...
            <br />
            <small>Share room code: {roomCode}</small>
          </div>
        ) : gameState.winner ? (
  <div
    style={{
      padding: "20px 35px",
      borderRadius: "18px",
      background: "#111722",
      border: `3px solid ${
        gameState.winner === "X"
          ? theme.primary
          : gameState.winner === "O"
          ? theme.secondary
          : "#ffffff"
      }`,
      boxShadow: `0 0 25px ${
        gameState.winner === "X"
          ? theme.primary
          : gameState.winner === "O"
          ? theme.secondary
          : "#ffffff"
      }`,
      textAlign: "center",
      fontSize: "22px",
    }}
  >
    {gameState.winner === "draw" ? (
      <>
        🤝
        <div style={{ fontSize: "28px", fontWeight: "bold" }}>
          DRAW!
        </div>
        <div style={{ fontSize: "14px", opacity: 0.7 }}>
          Nobody wins this round
        </div>
      </>
    ) : (
      <>
        🏆
        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color:
              gameState.winner === "X"
                ? theme.primary
                : theme.secondary,
          }}
        >
          {gameState.winner === "X"
            ? gameState.player1?.name
            : gameState.player2?.name}{" "}
          WINS!
        </div>
      </>
    )}
  </div>
) : null}

        {/* BOARD */}

        <TicTacToeBoard
          board={gameState.board}
          play={play}
          theme={theme}
        />

        {/* CONTROLS */}

        <button
  onClick={leaveGame}
  style={{
    padding: "9px 18px",
    borderRadius: "10px",
    border: "1px solid #555",
    background: "#111722",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  🚪 Leave Game
</button>

        {gameState.winner && (
          <button
  onClick={restart}
  style={{
    padding: "12px 24px",
    borderRadius: "12px",
    border: `2px solid ${theme.primary}`,
    background: theme.primary,
    color: "#000",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  }}
>
  🔄 PLAY AGAIN
</button>
        )}

        {message && (
          <div style={{ color: theme.secondary }}>
            {message}
          </div>
        )}
      </main>
    );
  }

  /*
   * CREATE / JOIN SCREEN
   */

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
        gap: "20px",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ color: theme.primary }}>
        🎮 TIC TAC TOE
      </h1>

      <h2>🌐 Online Multiplayer</h2>

      <div style={{ width: "min(90vw, 400px)" }}>
        <label>Your Name</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
          style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: "8px",
            padding: "13px",
            borderRadius: "10px",
            background: "#111722",
            color: "white",
            border: "2px solid #303642",
            fontSize: "16px",
          }}
        />
      </div>

      <button
        onClick={createRoom}
        disabled={loading}
        style={{
          width: "min(90vw, 400px)",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          background: theme.primary,
          color: "white",
          fontSize: "17px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        🎮 {loading ? "Creating..." : "Create Room"}
      </button>

      <div style={{ opacity: 0.5 }}>— OR —</div>

      <div style={{ width: "min(90vw, 400px)" }}>
        <label>Room Code</label>

        <input
          value={roomCode}
          onChange={(e) =>
            setRoomCode(e.target.value.toUpperCase())
          }
          placeholder="ABC123"
          maxLength={6}
          style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: "8px",
            padding: "13px",
            borderRadius: "10px",
            background: "#111722",
            color: "white",
            border: "2px solid #303642",
            fontSize: "20px",
            textAlign: "center",
            letterSpacing: "4px",
          }}
        />
      </div>

      <button
        onClick={joinRoom}
        disabled={loading}
        style={{
          width: "min(90vw, 400px)",
          padding: "14px",
          borderRadius: "12px",
          border: `2px solid ${theme.secondary}`,
          background: "#111722",
          color: "white",
          fontSize: "17px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        🚀 {loading ? "Joining..." : "Join Room"}
      </button>

      {message && (
        <div
          style={{
            textAlign: "center",
            color: theme.secondary,
          }}
        >
          {message}
        </div>
      )}
    </main>
  );
}