"use client";

import { useEffect, useMemo, useState } from "react";

import DotsBoard from "../components/DotsBoard";
import DotsScoreboard from "../components/DotsScoreboard";

import {
  BOARD_SIZES,
  COLORS,
  createGame,
  makeMove,
  updatePlayerColor,
  updatePlayerName,
  type GameState,
  type Player,
} from "../components/DotsGame";

import { supabase } from "@/lib/supabase";

type OnlineState = GameState & {
  player2Joined: boolean;
};

function makeRoomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function makeInitialOnlineGame(): OnlineState {
  return {
    ...createGame(),
    player2Joined: false,
  };
}

export default function OnlineDotsAndBoxesPage() {
  const [game, setGame] = useState<OnlineState>(
    makeInitialOnlineGame
  );

  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [connected, setConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [roomStarted, setRoomStarted] = useState(false);

  const [setupOpen, setSetupOpen] = useState(false);

  const players: Player[] = useMemo(
    () =>
      game.playerCount === 2
        ? [1, 2]
        : [1, 2, 3],
    [game.playerCount]
  );

  /*
   * ─────────────────────────────────────────
   * CREATE ROOM
   * ─────────────────────────────────────────
   */

  async function createRoom() {
    setLoading(true);
    setError("");

    try {
      const code = makeRoomCode();

      const initialGame = makeInitialOnlineGame();

      const { error: insertError } =
        await supabase
          .from("game_rooms")
          .insert({
            room_code: code,
            game: "dots-and-boxes",
            state: initialGame,
          });

      if (insertError) {
        throw insertError;
      }

      setRoomCode(code);
      setGame(initialGame);
      setIsHost(true);
      setConnected(true);
      setRoomStarted(false);
    } catch (err) {
      console.error(err);

      setError(
        "Could not create room. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ─────────────────────────────────────────
   * JOIN ROOM
   * ─────────────────────────────────────────
   */

  async function joinRoom() {
    const code = joinCode
      .trim()
      .toUpperCase();

    if (!code) {
      setError("Enter a room code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } =
        await supabase
          .from("game_rooms")
          .select("*")
          .eq("room_code", code)
          .eq("game", "dots-and-boxes")
          .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error("Room not found.");
      }

      const currentState =
        data.state as OnlineState;

      if (currentState.player2Joined) {
        setError(
          "This room already has two players."
        );

        setLoading(false);
        return;
      }

      const updatedState: OnlineState = {
        ...currentState,
        player2Joined: true,
      };

      const { error: updateError } =
        await supabase
          .from("game_rooms")
          .update({
            state: updatedState,
          })
          .eq("room_code", code);

      if (updateError) {
        throw updateError;
      }

      setRoomCode(code);
      setGame(updatedState);
      setIsHost(false);
      setConnected(true);
      setRoomStarted(true);
    } catch (err) {
      console.error(err);

      setError(
        "Could not join room. Check the room code."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ─────────────────────────────────────────
   * REALTIME
   * ─────────────────────────────────────────
   */

  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase
      .channel(`dots-boxes-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          const record =
            payload.new as {
              state?: OnlineState;
            };

          if (!record?.state) return;

          const nextState =
            record.state;

          setGame(nextState);

          if (nextState.player2Joined) {
            setRoomStarted(true);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  /*
   * ─────────────────────────────────────────
   * SAVE GAME STATE
   * ─────────────────────────────────────────
   */

  async function syncGame(
    nextGame: OnlineState
  ) {
    if (!roomCode) return;

    const { error: updateError } =
      await supabase
        .from("game_rooms")
        .update({
          state: nextGame,
        })
        .eq("room_code", roomCode);

    if (updateError) {
      console.error(updateError);

      setError(
        "Game sync failed. Please check your connection."
      );
    }
  }

  /*
   * ─────────────────────────────────────────
   * MOVE
   * ─────────────────────────────────────────
   */

  function handleMove(
    type: "horizontal" | "vertical",
    row: number,
    col: number
  ) {
    if (!connected) return;
    if (!roomStarted) return;
    if (game.gameOver) return;

    /*
     * Host controls Player 1.
     * Guest controls Player 2.
     */

    const currentPlayer: Player =
      isHost ? 1 : 2;

    if (game.turn !== currentPlayer) {
      return;
    }

    const nextGame =
      makeMove(
        game,
        type,
        row,
        col
      );

    if (nextGame === game) return;

    const onlineGame: OnlineState = {
      ...nextGame,
      player2Joined:
        game.player2Joined,
    };

    setGame(onlineGame);

    void syncGame(onlineGame);
  }

  /*
   * ─────────────────────────────────────────
   * NEW GAME
   * ─────────────────────────────────────────
   */

  async function newGame() {
    if (!roomCode) return;

    const freshGame: OnlineState = {
      ...createGame(
        game.size,
        game.playerCount,
        game.names,
        game.colors,
        game.wins,
        game.draws
      ),
      player2Joined: true,
    };

    setGame(freshGame);

    await syncGame(freshGame);
  }

  /*
   * ─────────────────────────────────────────
   * PLAYER SETTINGS
   * ─────────────────────────────────────────
   */

  function changeName(
    player: Player,
    value: string
  ) {
    /*
     * In online mode only the host changes
     * shared player settings.
     */

    if (!isHost) return;

    const nextGame =
      updatePlayerName(
        game,
        player,
        value
      );

    const onlineGame: OnlineState = {
      ...nextGame,
      player2Joined:
        game.player2Joined,
    };

    setGame(onlineGame);

    void syncGame(onlineGame);
  }

  function changeColor(
    player: Player,
    value: string
  ) {
    if (!isHost) return;

    const nextGame =
      updatePlayerColor(
        game,
        player,
        value
      );

    const onlineGame: OnlineState = {
      ...nextGame,
      player2Joined:
        game.player2Joined,
    };

    setGame(onlineGame);

    void syncGame(onlineGame);
  }

  function changeSize(
    size: number
  ) {
    if (!isHost) return;

    const freshGame: OnlineState = {
      ...createGame(
        size,
        game.playerCount,
        game.names,
        game.colors,
        game.wins,
        game.draws
      ),
      player2Joined:
        game.player2Joined,
    };

    setGame(freshGame);

    void syncGame(freshGame);
  }

  function changePlayerCount(
    count: 2 | 3
  ) {
    if (!isHost) return;

    const freshGame: OnlineState = {
      ...createGame(
        game.size,
        count,
        game.names,
        game.colors,
        game.wins,
        game.draws
      ),
      player2Joined:
        game.player2Joined,
    };

    setGame(freshGame);

    void syncGame(freshGame);
  }

  /*
   * ─────────────────────────────────────────
   * LEAVE / RESET UI
   * ─────────────────────────────────────────
   */

  function leaveRoom() {
    setRoomCode("");
    setJoinCode("");
    setConnected(false);
    setIsHost(false);
    setRoomStarted(false);
    setGame(makeInitialOnlineGame());
    setError("");
  }

  /*
   * ─────────────────────────────────────────
   * ROOM SCREEN
   * ─────────────────────────────────────────
   */

  if (!roomCode) {
    return (
      <main className="min-h-screen bg-[#fff8f1] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">

          <header className="mb-8">
            <div className="mb-1 text-[11px] font-black tracking-[0.3em] text-orange-600">
              GAMIFILO
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Dots & Boxes
            </h1>

            <p className="mt-2 text-sm font-bold text-slate-600 sm:text-base">
              Online Multiplayer
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">

            {/* CREATE */}
            <section className="rounded-[28px] border-2 border-orange-100 bg-white p-6 text-slate-950 shadow-sm">

              <div className="mb-2 text-2xl">
                🌐
              </div>

              <h2 className="text-xl font-black text-slate-950">
                Create Room
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Create a room and invite another player.
              </p>

              <button
                onClick={createRoom}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Creating..."
                  : "Create Room"}
              </button>

            </section>

            {/* JOIN */}
            <section className="rounded-[28px] border-2 border-orange-100 bg-white p-6 text-slate-950 shadow-sm">

              <div className="mb-2 text-2xl">
                👥
              </div>

              <h2 className="text-xl font-black text-slate-950">
                Join Room
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Enter the room code shared by your opponent.
              </p>

             <input
  value={joinCode}
  onChange={(event) =>
    setJoinCode(
      event.target.value
        .toUpperCase()
        .slice(0, 6)
    )
  }
  placeholder="ABC123"
  maxLength={6}
  style={{
    color: "#0f172a",
    WebkitTextFillColor: "#0f172a",
  }}
  className="mt-6 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-black uppercase tracking-[0.3em] !text-slate-950 !placeholder:text-slate-400 outline-none focus:border-orange-400"
/>

              <button
                onClick={joinRoom}
                disabled={
                  loading ||
                  joinCode.length !== 6
                }
                className="mt-3 w-full rounded-xl bg-orange-500 px-4 py-3 font-black text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Joining..."
                  : "Join Room"}
              </button>

            </section>

          </div>

          {error && (
            <div className="mt-4 rounded-xl border-2 border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

        </div>
      </main>
    );
  }

  /*
   * ─────────────────────────────────────────
   * WAITING SCREEN
   * ─────────────────────────────────────────
   */

  if (!roomStarted) {
    return (
      <main className="min-h-screen bg-[#fff8f1] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          <header className="mb-6">
            <div className="mb-1 text-[11px] font-black tracking-[0.3em] text-orange-600">
              GAMIFILO
            </div>

            <h1 className="text-3xl font-black text-slate-950 sm:text-5xl">
              Dots & Boxes
            </h1>
          </header>

          <div className="rounded-[32px] border-2 border-orange-100 bg-white p-6 text-center text-slate-950 shadow-sm sm:p-10 border-slate-700 bg-slate-800 text-white">

            <div className="text-5xl">
              ⏳
            </div>

            <h2 className="mt-4 text-2xl font-black text-slate-950 text-white">
              Waiting for Player 2
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Share this room code with your opponent.
            </p>

            <div className="mx-auto mt-6 max-w-xs rounded-2xl border-2 border-orange-200 bg-orange-50 px-4 py-5">

              <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                Room Code
              </div>

              <div className="mt-2 text-4xl font-black tracking-[0.25em] !text-slate-950">
  {roomCode}
</div>

            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-orange-500" />
              Waiting for opponent...
            </div>

            <button
              onClick={leaveRoom}
              className="mt-6 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-200"
            >
              Leave Room
            </button>

          </div>

        </div>
      </main>
    );
  }

  /*
   * ─────────────────────────────────────────
   * GAME SCREEN
   * ─────────────────────────────────────────
   */

  return (
    <main className="min-h-screen bg-[#fff8f1] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">

      <div className="mx-auto min-h-screen max-w-[1400px] text-slate-950">

        {/* HEADER */}

        <header className="mb-4 flex items-center justify-between gap-3">

          <div>

            <div className="mb-1 text-[11px] font-black tracking-[0.3em] text-orange-600">
              GAMIFILO
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
              Dots & Boxes — Online
            </h1>

            <p className="mt-1 hidden text-sm font-bold text-slate-600 sm:block">
              Play against another player online.
            </p>

          </div>

          <div className="flex gap-2">

            <button
              onClick={() =>
                setSetupOpen(
                  !setupOpen
                )
              }
              className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-950 shadow-sm sm:px-4"
            >
              ⚙ Settings
            </button>

            <button
              onClick={newGame}
              className="rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-black text-white shadow-sm sm:px-4"
            >
              New Game
            </button>

          </div>

        </header>

        {/* ROOM BAR */}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-950 shadow-sm">

          <div>

            <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">
              Room
            </div>

            <div className="font-black tracking-[0.2em]">
              {roomCode}
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="text-xs font-black text-slate-500">
              {isHost
                ? "You are Player 1"
                : "You are Player 2"}
            </div>

            <span className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-black text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Online
            </span>

            <button
              onClick={leaveRoom}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200"
            >
              Leave
            </button>

          </div>

        </div>

        {/* MAIN */}

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">

          {/* BOARD */}

          <section className="min-w-0">

            {/* TURN BAR */}

            <div className="mb-3 flex items-center justify-between rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-950 shadow-sm">

              <div className="flex min-w-0 items-center gap-3">

                <span
                  className="h-4 w-4 shrink-0 rounded-full ring-4 ring-slate-100"
                  style={{
                    backgroundColor:
                      game.colors[
                        game.turn
                      ],
                  }}
                />

                <div className="min-w-0">

                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {game.gameOver
                      ? "Game finished"
                      : "Current turn"}
                  </div>

                  <div className="truncate text-base font-black sm:text-lg">
                    {game.message}
                  </div>

                </div>

              </div>

              <div className="hidden rounded-xl bg-orange-50 px-3 py-2 text-right text-slate-950 sm:block">

                <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                  Board
                </div>

                <div className="font-black">
                  {game.size} × {game.size}
                </div>

              </div>

            </div>

            {/* BOARD CARD */}

            <div className="rounded-[28px] border-2 border-orange-100 bg-white p-3 text-slate-950 shadow-[0_12px_40px_rgba(120,53,15,0.10)] border-slate-700 bg-slate-800 text-white sm:p-5">

              <div
                className="relative mx-auto aspect-square w-full"
                style={{
                  maxWidth:
                    game.size <= 6
                      ? "620px"
                      : game.size <= 10
                      ? "700px"
                      : "760px",
                }}
              >

                <DotsBoard
                  game={game}
                  onMove={
                    handleMove
                  }
                />

              </div>

              {game.gameOver && (
                <div className="mt-5 rounded-2xl bg-slate-950 px-5 py-4 text-center text-white">

                  <div className="text-2xl">
                    🏆
                  </div>

                  <div className="mt-1 text-lg font-black">
                    {game.message}
                  </div>

                  <button
                    onClick={newGame}
                    className="mt-3 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-black transition hover:bg-orange-400"
                  >
                    Play Again
                  </button>

                </div>
              )}

            </div>

          </section>

          {/* DESKTOP SIDE PANEL */}

          <aside className="hidden space-y-3 lg:block">

            <DotsScoreboard
              game={game}
            />

            <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 text-slate-950 border-slate-700 bg-slate-800 text-white">

              <button
                onClick={() =>
                  setSetupOpen(
                    !setupOpen
                  )
                }
                className="flex w-full items-center justify-between text-left"
              >

                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                    Setup
                  </div>

                  <div className="text-base font-black">
                    Player Setup
                  </div>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black">
                  {setupOpen
                    ? "Hide ▲"
                    : "Show ▼"}
                </span>

              </button>

              {setupOpen && (
                <div className="mt-4">

                  {/* PLAYER COUNT */}

                  <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Players
                  </label>

                  <div className="mb-4 grid grid-cols-2 gap-2">

                    {[2, 3].map(
                      count => (
                        <button
                          key={count}
                          disabled={
                            !isHost
                          }
                          onClick={() =>
                            changePlayerCount(
                              count as 2 | 3
                            )
                          }
                          className={
                            game.playerCount ===
                            count
                              ? "rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-black text-white disabled:opacity-50"
                              : "rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-black text-slate-700 disabled:opacity-50"
                          }
                        >
                          {count} Players
                        </button>
                      )
                    )}

                  </div>

                  {/* BOARD SIZE */}

                  <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Board Size
                  </label>

                  <div className="mb-5 grid grid-cols-4 gap-2">

                    {BOARD_SIZES.map(
                      boardSize => (
                        <button
                          key={boardSize}
                          disabled={
                            !isHost
                          }
                          onClick={() =>
                            changeSize(
                              boardSize
                            )
                          }
                          className={
                            game.size ===
                            boardSize
                              ? "rounded-lg bg-orange-500 py-2 text-xs font-black text-white disabled:opacity-50"
                              : "rounded-lg bg-slate-100 py-2 text-xs font-black text-slate-700 disabled:opacity-50"
                          }
                        >
                          {boardSize}×
                          {boardSize}
                        </button>
                      )
                    )}

                  </div>

                  {/* NAMES / COLORS */}

                  <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Player Names & Colors
                  </label>

                  <div className="space-y-2">

                    {players.map(
                      player => (
                        <div
                          key={player}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-3 border-slate-600 bg-slate-700"
                        >

                          <div className="mb-2 flex items-center gap-2">

                            <span
                              className="h-3.5 w-3.5 rounded-full"
                              style={{
                                backgroundColor:
                                  game.colors[
                                    player
                                  ],
                              }}
                            />

                            <span className="text-sm font-black">
                              Player{" "}
                              {player}
                            </span>

                          </div>

                          <input
                            value={
                              game.names[
                                player
                              ]
                            }
                            maxLength={20}
                            disabled={
                              !isHost
                            }
                            onChange={event =>
                              changeName(
                                player,
                                event
                                  .target
                                  .value
                              )
                            }
                            className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none disabled:opacity-50 border-slate-600 bg-slate-800 text-white"
                          />

                          <div className="flex flex-wrap gap-2">

                            {COLORS.map(
                              color => (
                                <button
                                  key={color}
                                  disabled={
                                    !isHost
                                  }
                                  onClick={() =>
                                    changeColor(
                                      player,
                                      color
                                    )
                                  }
                                  aria-label={`Choose color for Player ${player}`}
                                  className="h-7 w-7 rounded-full transition hover:scale-110 disabled:opacity-40"
                                  style={{
                                    backgroundColor:
                                      color,

                                    boxShadow:
                                      game
                                        .colors[
                                        player
                                      ] ===
                                      color
                                        ? "0 0 0 3px white, 0 0 0 5px #0f172a"
                                        : "none",
                                  }}
                                />
                              )
                            )}

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

          </aside>

        </div>

        {/* MOBILE SCOREBOARD */}

        <div className="mt-4 lg:hidden">
          <DotsScoreboard
            game={game}
          />
        </div>

        {/* MOBILE SETTINGS */}

        {setupOpen && (
          <div className="mt-4 rounded-2xl border-2 border-orange-100 bg-white p-4 text-slate-950 border-slate-700 bg-slate-800 text-white lg:hidden">

            <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-orange-600">
              Settings
            </div>

            <div className="space-y-3">

              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                Board Size
              </label>

              <div className="grid grid-cols-4 gap-2">

                {BOARD_SIZES.map(
                  boardSize => (
                    <button
                      key={boardSize}
                      disabled={!isHost}
                      onClick={() =>
                        changeSize(
                          boardSize
                        )
                      }
                      className={
                        game.size ===
                        boardSize
                          ? "rounded-lg bg-orange-500 py-2 text-xs font-black text-white"
                          : "rounded-lg bg-slate-100 py-2 text-xs font-black text-slate-700"
                      }
                    >
                      {boardSize}×
                      {boardSize}
                    </button>
                  )
                )}

              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}