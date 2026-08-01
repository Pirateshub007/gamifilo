"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Player = 1 | 2;

type GameState = {
  size: number;
  horizontal: boolean[][];
  vertical: boolean[][];
  boxes: number[][];
  turn: Player;
  scores: Record<Player, number>;
  player2Joined: boolean;
  gameOver: boolean;
  message: string;
};

const BOARD_SIZES = [4, 5, 6, 8, 10, 12, 15];

const COLORS = {
  1: "#f97316",
  2: "#2563eb",
};

function makeHorizontal(size: number) {
  return Array.from({ length: size + 1 }, () =>
    Array(size).fill(false)
  );
}

function makeVertical(size: number) {
  return Array.from({ length: size }, () =>
    Array(size + 1).fill(false)
  );
}

function makeBoxes(size: number) {
  return Array.from({ length: size }, () =>
    Array(size).fill(0)
  );
}

function createGameState(size: number): GameState {
  return {
    size,
    horizontal: makeHorizontal(size),
    vertical: makeVertical(size),
    boxes: makeBoxes(size),
    turn: 1,
    scores: {
      1: 0,
      2: 0,
    },
    player2Joined: false,
    gameOver: false,
    message: "Player 1's turn",
  };
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

export default function OnlineDotsAndBoxesPage() {
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");

  const [player, setPlayer] = useState<Player | null>(null);

  const [game, setGame] = useState<GameState | null>(null);

  const [name, setName] = useState("");
  const [opponentName, setOpponentName] = useState("");

  const [selectedSize, setSelectedSize] = useState(4);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);

  const isCreator = player === 1;

  const currentPlayerName =
    player === 1
      ? name || "Player 1"
      : opponentName || "Player 2";

  const opponentDisplayName =
    player === 1
      ? opponentName || "Player 2"
      : name || "Player 1";

  const canPlay =
    !!game &&
    !!player &&
    !game.gameOver &&
    game.player2Joined &&
    game.turn === player;

  const boardMaxWidth = useMemo(() => {
    if (!game) return "620px";

    if (game.size <= 6) return "620px";
    if (game.size <= 10) return "700px";

    return "760px";
  }, [game]);

  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase
      .channel(`dots-room-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        payload => {
          if (payload.eventType === "DELETE") return;

          const newRow = payload.new as {
            state?: GameState;
          };

          if (newRow?.state) {
            setGame(newRow.state);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  async function createRoom() {
    setError("");
    setLoading(true);

    try {
        
      const code = generateRoomCode();

      const initialState = createGameState(selectedSize);

      const { error: insertError } = await supabase
        .from("game_rooms")
        .insert({
          room_code: code,
          game: "dots-and-boxes",
          state: initialState,
        });

      if (insertError) {
  setError(
    "SUPABASE ERROR: " +
      String(insertError.message || insertError.details || insertError.code || insertError)
  );

  return;
}

      setRoomCode(code);
      setPlayer(1);
      setGame(initialState);
      setOpponentName("");

    } catch (err: any) {
  console.error("CREATE ROOM ERROR:", {
    message: err?.message,
    details: err?.details,
    hint: err?.hint,
    code: err?.code,
    error: err,
  });

  setError(
    err?.message ||
      err?.details ||
      "Couldn't create the room. Please try again."
  );
} finally {
      setLoading(false);
    }
  }

  async function joinRoom() {
  setError("");

  const code = inputCode.replace(/\s/g, "").toUpperCase();

  console.log("JOIN STARTED:", code);

  if (!code) {
    setError("Enter a room code.");
    return;
  }

  if (code.length !== 6) {
    setError("Room code must be 6 characters.");
    return;
  }

  setLoading(true);

  try {
    console.log("JOIN FUNCTION STARTED", code);
    // 1. Find room
    const { data, error: fetchError } = await supabase
      .from("game_rooms")
      .select("room_code, game, state")
      .eq("room_code", code)
      .eq("game", "dots-and-boxes")
      .maybeSingle();

    console.log("ROOM FETCH:", { data, fetchError });

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (!data) {
      setError("Room not found. Check the code.");
      return;
    }

    const currentState = data.state as GameState;

    if (currentState.player2Joined) {
      setError("This room already has two players.");
      return;
    }

    // 2. Mark Player 2 joined
    const updatedState: GameState = {
      ...currentState,
      player2Joined: true,
      message: "Player 1's turn",
    };

    const { error: updateError } = await supabase
      .from("game_rooms")
      .update({
        state: updatedState,
      })
      .eq("room_code", code)
      .eq("game", "dots-and-boxes");

    console.log("ROOM UPDATE:", updateError);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 3. Successfully joined
    setRoomCode(code);
    setPlayer(2);
    setGame(updatedState);
    setError("");

  } catch (err: any) {
    console.error("JOIN FAILED:", err);

    setError(
      "Join failed: " +
        String(
          err?.message ||
          err?.details ||
          err?.hint ||
          "Unknown error"
        )
    );
  } finally {
    setLoading(false);
  }
}
  async function updateGame(updatedState: GameState) {
    if (!roomCode) return;

    setGame(updatedState);

    const { error: updateError } = await supabase
      .from("game_rooms")
      .update({
        state: updatedState,
      })
      .eq("room_code", roomCode);

    if (updateError) {
      console.error(updateError);
      setError("Connection problem. Your move may not have synced.");
    }
  }

  async function playLine(
    type: "h" | "v",
    row: number,
    col: number
  ) {
    if (!game || !player) return;

    if (!canPlay) return;

    const newHorizontal = game.horizontal.map(row => [...row]);
    const newVertical = game.vertical.map(row => [...row]);
    const newBoxes = game.boxes.map(row => [...row]);

    if (type === "h") {
      if (newHorizontal[row][col]) return;

      newHorizontal[row][col] = true;
    } else {
      if (newVertical[row][col]) return;

      newVertical[row][col] = true;
    }

    let completed = 0;

    for (let r = 0; r < game.size; r++) {
      for (let c = 0; c < game.size; c++) {
        const complete =
          newHorizontal[r][c] &&
          newHorizontal[r + 1][c] &&
          newVertical[r][c] &&
          newVertical[r][c + 1];

        if (
          complete &&
          newBoxes[r][c] === 0
        ) {
          newBoxes[r][c] = player;
          completed++;
        }
      }
    }

    const newScores = {
      ...game.scores,
      [player]: game.scores[player] + completed,
    };

    const totalBoxes = newBoxes
      .flat()
      .filter(Boolean).length;

    let nextTurn = player;
    let gameOver = false;
    let message = "";

    if (totalBoxes === game.size * game.size) {
      gameOver = true;

      if (newScores[1] > newScores[2]) {
        message = "Player 1 wins! 🏆";
      } else if (newScores[2] > newScores[1]) {
        message = "Player 2 wins! 🏆";
      } else {
        message = "It's a draw! 🤝";
      }
    } else if (completed > 0) {
      nextTurn = player;

      message =
        completed === 1
          ? `${currentPlayerName} completed a box — extra turn!`
          : `${currentPlayerName} completed ${completed} boxes — extra turn!`;
    } else {
      nextTurn = player === 1 ? 2 : 1;

      message =
        nextTurn === player
          ? `${currentPlayerName}'s turn`
          : `${nextTurn === 1 ? name || "Player 1" : opponentName || "Player 2"}'s turn`;
    }

    const updatedState: GameState = {
      ...game,
      horizontal: newHorizontal,
      vertical: newVertical,
      boxes: newBoxes,
      scores: newScores,
      turn: nextTurn,
      gameOver,
      message,
    };

    await updateGame(updatedState);
  }

  async function newOnlineGame() {
    if (!roomCode || !game) return;

    const freshState = createGameState(game.size);

    freshState.player2Joined = true;

    await updateGame(freshState);
  }

  async function copyRoomCode() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setError("Couldn't copy the room code.");
    }
  }

  if (!roomCode) {
    return (
      <main
  className="min-h-screen bg-[#fff3e6] px-4 py-6 text-slate-950 sm:px-6"
  style={{
    position: "relative",
    zIndex: 1,
    pointerEvents: "auto",
    touchAction: "manipulation",
  }}
>
        <div className="mx-auto max-w-2xl">

          <div className="mb-8">
            <div className="text-[11px] font-black tracking-[0.3em] text-orange-600">
              GAMIFILO
            </div>

            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-5xl">
              Dots & Boxes
            </h1>

            <p className="mt-2 font-bold text-slate-600">
              Online Multiplayer
            </p>
          </div>

          <div className="rounded-[28px] border-2 border-orange-100 bg-white p-5 shadow-[0_12px_40px_rgba(120,53,15,0.10)] sm:p-7">

            <div className="mb-6">
              <h2 className="text-xl font-black">
                Your temporary name
              </h2>

              <p className="mt-1 text-sm font-bold text-slate-500">
                You can use a temporary name for now.
              </p>

              <input
                value={name}
                onChange={event =>
                  setName(event.target.value)
                }
                maxLength={20}
                placeholder="Your name"
                className="mt-3 w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-orange-400"
              />
            </div>

            <div className="relative z-50 rounded-2xl bg-orange-50 p-4">
              <h3 className="font-black">
                Create a room
              </h3>

              <p className="mt-1 text-sm font-bold text-slate-600">
                Choose a board and invite another player.
              </p>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {BOARD_SIZES.map(boardSize => (
                  <button
                    key={boardSize}
                    onClick={() =>
                      setSelectedSize(boardSize)
                    }
                    className={
                      selectedSize === boardSize
                        ? "touch-manipulation rounded-xl bg-orange-500 py-2.5 text-xs font-black text-white"
                        : "touch-manipulation rounded-xl bg-white py-2.5 text-xs font-black text-slate-700"
                    }
                  >
                    {boardSize}×{boardSize}
                  </button>
                ))}
              </div>

              <button
                onClick={createRoom}
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-slate-950 py-3.5 font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading
                  ? "Creating..."
                  : "🎮 Create Room"}
              </button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-black uppercase text-slate-400">
                OR
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="relative z-[999999] pointer-events-auto">
  <h3 className="font-black">
    Join a room
  </h3>

  <div className="relative z-[999999] mt-3 flex gap-2 pointer-events-auto">
  <input
    type="text"
    value={inputCode}
    onChange={(event) =>
      setInputCode(
        event.target.value
          .replace(/\s/g, "")
          .toUpperCase()
      )
    }
    maxLength={6}
    placeholder="ABC123"
    className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-center font-black tracking-[0.2em] outline-none focus:border-orange-400"
  />

  <button
  type="button"
  onPointerDown={() => alert("POINTER DOWN WORKS")}
  onPointerUp={() => alert("POINTER UP WORKS")}
  onClick={() => alert("CLICK WORKS")}
  className="fixed left-4 top-4 z-[9999999] min-h-[60px] rounded-xl bg-red-600 px-8 py-4 text-lg font-black text-white shadow-2xl"
>
  TEST TOUCH
</button>
</div>
</div>
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (!game || !player) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff3e6] p-6">
        <div className="font-black">
          Loading game...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff3e6] px-3 py-4 text-slate-950 sm:px-5">
      <div className="mx-auto max-w-[1500px]">

        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-black tracking-[0.3em] text-orange-600">
              GAMIFILO • ONLINE
            </div>

            <h1 className="text-2xl font-black sm:text-4xl">
              Dots & Boxes
            </h1>
          </div>

          <div className="rounded-xl border-2 border-orange-200 bg-white px-4 py-2 text-center">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Room Code
            </div>

            <div className="text-lg font-black tracking-[0.2em]">
              {roomCode}
            </div>
          </div>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">

          <section className="min-w-0">

            <div className="mb-3 flex items-center justify-between rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-4 w-4 shrink-0 rounded-full ring-4 ring-slate-100"
                  style={{
                    backgroundColor:
                      COLORS[game.turn],
                  }}
                />

                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {game.gameOver
                      ? "Game finished"
                      : game.player2Joined
                      ? "Current turn"
                      : "Waiting"}
                  </div>

                  <div className="truncate text-base font-black sm:text-lg">
                    {game.player2Joined
                      ? game.message
                      : "Waiting for Player 2..."}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border-2 border-orange-100 bg-white p-3 shadow-[0_12px_40px_rgba(120,53,15,0.10)] sm:p-5">

              <div
                className="relative mx-auto aspect-square w-full"
                style={{
                  maxWidth: boardMaxWidth,
                }}
              >

                {Array.from({
                  length: game.size + 1,
                }).map((_, row) =>
                  Array.from({
                    length: game.size,
                  }).map((_, col) => (
                    <button
                      key={`h-${row}-${col}`}
                      disabled={
                        game.horizontal[row][col] ||
                        !canPlay
                      }
                      onClick={() =>
                        playLine("h", row, col)
                      }
                      aria-label="Horizontal line"
                      className="absolute z-30 -translate-y-1/2 rounded-full transition hover:scale-y-125 disabled:cursor-default"
                      style={{
                        left:
                          (col / game.size) *
                            100 +
                          "%",
                        top:
                          (row / game.size) *
                            100 +
                          "%",
                        width:
                          100 / game.size +
                          "%",
                        height:
                          game.size >= 12
                            ? 8
                            : 12,
                        backgroundColor:
                          game.horizontal[row][col]
                            ? COLORS[game.boxes
                                .flat()
                                .find(Boolean) as Player] || "#334155"
                            : "#94a3b8",
                      }}
                    />
                  ))
                )}

                {Array.from({
                  length: game.size,
                }).map((_, row) =>
                  Array.from({
                    length: game.size + 1,
                  }).map((_, col) => (
                    <button
                      key={`v-${row}-${col}`}
                      disabled={
                        game.vertical[row][col] ||
                        !canPlay
                      }
                      onClick={() =>
                        playLine("v", row, col)
                      }
                      aria-label="Vertical line"
                      className="absolute z-30 -translate-x-1/2 rounded-full transition hover:scale-x-125 disabled:cursor-default"
                      style={{
                        left:
                          (col / game.size) *
                            100 +
                          "%",
                        top:
                          (row / game.size) *
                            100 +
                          "%",
                        height:
                          100 / game.size +
                          "%",
                        width:
                          game.size >= 12
                            ? 8
                            : 12,
                        backgroundColor:
                          game.vertical[row][col]
                            ? "#334155"
                            : "#94a3b8",
                      }}
                    />
                  ))
                )}

                {Array.from({
                  length: game.size,
                }).map((_, row) =>
                  Array.from({
                    length: game.size,
                  }).map((_, col) => {
                    const owner =
                      game.boxes[row][col];

                    if (!owner) return null;

                    return (
                      <div
                        key={`box-${row}-${col}`}
                        className="pointer-events-none absolute flex items-center justify-center"
                        style={{
                          left:
                            (col / game.size) *
                              100 +
                            "%",
                          top:
                            (row / game.size) *
                              100 +
                            "%",
                          width:
                            100 / game.size +
                            "%",
                          height:
                            100 / game.size +
                            "%",
                        }}
                      >
                        <div
                          className="pointer-events-none flex h-[70%] w-[70%] items-center justify-center rounded-lg font-black text-white shadow-md"
                          style={{
                            backgroundColor:
                              COLORS[
                                owner as Player
                              ],
                            fontSize:
                              game.size >= 12
                                ? "7px"
                                : game.size >= 8
                                ? "9px"
                                : "12px",
                          }}
                        >
                          {owner === 1
                            ? "P1"
                            : "P2"}
                        </div>
                      </div>
                    );
                  })
                )}

                {Array.from({
                  length: game.size + 1,
                }).map((_, row) =>
                  Array.from({
                    length: game.size + 1,
                  }).map((_, col) => (
                    <span
                      key={`dot-${row}-${col}`}
                      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950 shadow-md"
                      style={{
                        left:
                          (col / game.size) *
                            100 +
                          "%",
                        top:
                          (row / game.size) *
                            100 +
                          "%",
                        width:
                          game.size >= 12
                            ? 7
                            : 11,
                        height:
                          game.size >= 12
                            ? 7
                            : 11,
                      }}
                    />
                  ))
                )}
              </div>

              {!game.player2Joined && (
                <div className="mt-5 rounded-2xl bg-orange-50 px-5 py-5 text-center">
                  <div className="text-2xl">
                    👥
                  </div>

                  <div className="mt-1 font-black">
                    Waiting for Player 2
                  </div>

                  <div className="mt-2 text-sm font-bold text-slate-600">
                    Send this room code:
                  </div>

                  <button
                    onClick={copyRoomCode}
                    className="mt-2 rounded-xl bg-slate-950 px-5 py-3 text-lg font-black tracking-[0.2em] text-white"
                  >
                    {copied
                      ? "COPIED!"
                      : roomCode}
                  </button>
                </div>
              )}

              {game.gameOver && (
                <div className="mt-5 rounded-2xl bg-slate-950 px-5 py-5 text-center text-white">
                  <div className="text-2xl">
                    🏆
                  </div>

                  <div className="mt-1 text-lg font-black">
                    {game.message}
                  </div>

                  <button
                    onClick={newOnlineGame}
                    className="mt-3 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-black"
                  >
                    Rematch
                  </button>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-3">

            <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-sm">

              <div className="mb-3 text-xs font-black uppercase tracking-widest text-orange-600">
                Players
              </div>

              <div className="space-y-2">

                <div className="rounded-xl bg-orange-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black">
                      {name || "Player 1"}
                    </span>

                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[1],
                      }}
                    />
                  </div>

                  <div className="mt-1 text-2xl font-black">
                    {game.scores[1]}
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black">
                      {opponentName || "Player 2"}
                    </span>

                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[2],
                      }}
                    />
                  </div>

                  <div className="mt-1 text-2xl font-black">
                    {game.scores[2]}
                  </div>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-sm">

              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                You are
              </div>

              <div className="mt-1 text-lg font-black">
                {currentPlayerName}
              </div>

              <div className="mt-1 text-sm font-bold text-slate-500">
                Playing against{" "}
                {opponentDisplayName}
              </div>

              <button
                onClick={copyRoomCode}
                className="mt-4 w-full rounded-xl bg-slate-950 py-3 font-black text-white"
              >
                {copied
                  ? "Room Code Copied!"
                  : "Copy Room Code"}
              </button>
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}