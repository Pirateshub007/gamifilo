"use client";

import { useState } from "react";

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

export default function LocalDotsAndBoxesPage() {
  const [game, setGame] = useState<GameState>(
    () => createGame()
  );

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [setupOpen, setSetupOpen] =
    useState(false);

function resetBoard(
  newSize = game.size,
  newPlayerCount = game.playerCount
) {
  setGame(
    createGame(
      newSize,
      newPlayerCount,
      game.names,
      game.colors,
      game.wins,
      game.draws
    )
  );
}

  function handleMove(
    type: "horizontal" | "vertical",
    row: number,
    col: number
  ) {
    setGame((current) =>
      makeMove(
        current,
        type,
        row,
        col
      )
    );
  }

  function changeName(
    player: Player,
    value: string
  ) {
    setGame((current) =>
      updatePlayerName(
        current,
        player,
        value
      )
    );
  }

  function changeColor(
    player: Player,
    value: string
  ) {
    setGame((current) =>
      updatePlayerColor(
        current,
        player,
        value
      )
    );
  }

  const players: Player[] =
    game.playerCount === 2
      ? [1, 2]
      : [1, 2, 3];

  return (
    <main className="min-h-screen bg-[#fff8f1] px-3 py-4 text-slate-950 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-[1250px]">

        {/* HEADER */}
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="mb-1 text-[11px] font-black tracking-[0.3em] text-orange-600">
              GAMIFILO
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
              Dots & Boxes
            </h1>

            <p className="mt-1 hidden text-sm font-bold text-slate-600 sm:block">
              Connect the dots. Complete boxes. Take the win.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setSettingsOpen(true)
              }
              className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-black shadow-sm transition hover:shadow-md sm:px-4"
            >
              ⚙ Settings
            </button>

            <button
              onClick={() => resetBoard()}
              className="rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 sm:px-4"
            >
              New Game
            </button>
          </div>
        </header>

        {/* MAIN */}
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">

          {/* BOARD AREA */}
          <section className="min-w-0">

            {/* TURN BAR */}
            <div className="mb-3 flex items-center justify-between rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 shadow-sm">
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

              <div className="hidden rounded-xl bg-orange-50 px-3 py-2 text-right sm:block">
                <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                  Board
                </div>

                <div className="font-black">
                  {game.size} × {game.size}
                </div>
              </div>
            </div>

            {/* BOARD CARD */}
            <div className="rounded-[28px] border-2 border-orange-100 bg-white p-3 shadow-[0_12px_40px_rgba(120,53,15,0.10)] sm:p-5">

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
                  onMove={handleMove}
                />
              </div>

              {/* GAME OVER */}
              {game.gameOver && (
                <div className="mt-5 rounded-2xl bg-slate-950 px-5 py-4 text-center text-white">
                  <div className="text-2xl">
                    🏆
                  </div>

                  <div className="mt-1 text-lg font-black">
                    {game.message}
                  </div>

                  <button
                    onClick={() =>
                      resetBoard()
                    }
                    className="mt-3 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-black transition hover:bg-orange-400"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          </section>

{/* MOBILE / TABLET SCOREBOARD */}
<div className="mt-4 lg:hidden">
  <DotsScoreboard game={game} />
</div>

      {/* DESKTOP SIDE PANEL */}
      <aside className="hidden space-y-3 lg:block">

        {/* SCOREBOARD */}
        <DotsScoreboard game={game} />

        {/* PLAYER SETUP */}
        <div className="rounded-2xl border-2 border-orange-100 bg-white p-4">
          <GameControls
            game={game}
            players={players}
            setupOpen={setupOpen}
            setSetupOpen={setSetupOpen}
            changeName={changeName}
            changeColor={changeColor}
            changeSize={(size) =>
              resetBoard(
                size,
                game.playerCount
              )
            }
            changePlayerCount={(count) =>
              resetBoard(
                game.size,
                count
              )
            }
          />
        </div>

      </aside>
      
       </div>

        {/* MOBILE SETTINGS */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 p-3 backdrop-blur-sm">

            <div className="mx-auto mt-4 max-h-[92vh] max-w-md overflow-y-auto rounded-[28px] bg-[#fff8f1] p-4 shadow-2xl sm:mt-8">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-orange-600">
                    GAMIFILO
                  </div>

                  <h2 className="text-xl font-black">
                    Game Settings
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setSettingsOpen(false)
                  }
                  className="rounded-xl bg-white px-4 py-2 text-lg font-black shadow-sm"
                >
                  ×
                </button>
              </div>

              <div className="mt-3 rounded-2xl border-2 border-orange-100 bg-white p-4">
                <GameControls
                  game={game}
                  players={players}
                  setupOpen={setupOpen}
                  setSetupOpen={setSetupOpen}
                  changeName={changeName}
                  changeColor={changeColor}
                  changeSize={(size) =>
                    resetBoard(
                      size,
                      game.playerCount
                    )
                  }
                  changePlayerCount={(count) =>
                    resetBoard(
                      game.size,
                      count
                    )
                  }
                />
              </div>

              <button
                onClick={() =>
                  setSettingsOpen(false)
                }
                className="mt-3 w-full rounded-xl bg-slate-950 py-3 font-black text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


/* ─────────────────────────────────────────
   GAME CONTROLS
───────────────────────────────────────── */

function GameControls({
  game,
  players,
  setupOpen,
  setSetupOpen,
  changeName,
  changeColor,
  changeSize,
  changePlayerCount,
}: {
  game: GameState;
  players: Player[];
  setupOpen: boolean;
  setSetupOpen: (
    open: boolean
  ) => void;

  changeName: (
    player: Player,
    value: string
  ) => void;

  changeColor: (
    player: Player,
    value: string
  ) => void;

  changeSize: (
    size: number
  ) => void;

  changePlayerCount: (
    count: 2 | 3
  ) => void;
}) {
  return (
    <div>

      {/* HEADER */}
      <button
        onClick={() =>
          setSetupOpen(!setupOpen)
        }
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">
            Setup
          </div>

          <div className="text-base font-black text-slate-950">
            Player Setup
          </div>
        </div>

        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black">
          {setupOpen
            ? "Hide ▲"
            : "Show ▼"}
        </span>
      </button>

      {/* CONTENT */}
      {setupOpen && (
        <div className="mt-4">

          {/* PLAYER COUNT */}
          <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
            Players
          </label>

          <div className="mb-4 grid grid-cols-2 gap-2">
            {[2, 3].map((count) => (
              <button
                key={count}
                onClick={() =>
                  changePlayerCount(
                    count as 2 | 3
                  )
                }
                className={
                  game.playerCount === count
                    ? "rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-black text-white"
                    : "rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-200"
                }
              >
                {count} Players
              </button>
            ))}
          </div>

          {/* BOARD SIZE */}
          <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
            Board Size
          </label>

          <div className="mb-5 grid grid-cols-4 gap-2">
            {BOARD_SIZES.map(
              (boardSize) => (
                <button
                  key={boardSize}
                  onClick={() =>
                    changeSize(
                      boardSize
                    )
                  }
                  className={
                    game.size === boardSize
                      ? "rounded-lg bg-orange-500 py-2 text-xs font-black text-white shadow-sm"
                      : "rounded-lg bg-slate-100 py-2 text-xs font-black text-slate-700 hover:bg-slate-200"
                  }
                >
                  {boardSize}×{boardSize}
                </button>
              )
            )}
          </div>

          {/* PLAYER NAMES + COLORS */}
          <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
            Player Names & Colors
          </label>

          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{
                      backgroundColor:
                        game.colors[player],
                    }}
                  />

                  <span className="text-sm font-black">
                    Player {player}
                  </span>
                </div>

                <input
                  value={
                    game.names[player]
                  }
                  maxLength={20}
                  onChange={(event) =>
                    changeName(
                      player,
                      event.target.value
                    )
                  }
                  className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />

                <div className="flex flex-wrap gap-2">
                  {COLORS.map(
                    (color) => (
                      <button
                        key={color}
                        onClick={() =>
                          changeColor(
                            player,
                            color
                          )
                        }
                        aria-label={`Choose color for Player ${player}`}
                        className="h-7 w-7 rounded-full transition hover:scale-110"
                        style={{
                          backgroundColor:
                            color,

                          boxShadow:
                            game.colors[
                              player
                            ] === color
                              ? "0 0 0 3px white, 0 0 0 5px #0f172a"
                              : "none",
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}