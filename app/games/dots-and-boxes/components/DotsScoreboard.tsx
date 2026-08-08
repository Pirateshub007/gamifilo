"use client";

import type {
  GameState,
  Player,
} from "./DotsGame";

type Props = {
  game: GameState;
};

export default function DotsScoreboard({
  game,
}: Props) {
  const players: Player[] =
    game.playerCount === 2
      ? [1, 2]
      : [1, 2, 3];

  return (
    <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-sm">

      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">
            Match
          </div>

          <h2 className="text-lg font-black text-slate-950">
            Scoreboard
          </h2>
        </div>

        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
          Local
        </span>
      </div>

      {/* CURRENT GAME */}
      <div className="mb-3 space-y-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">
          Current Game
        </div>

        {players.map((player) => {
          const color = game.colors[player];

          return (
            <div
              key={player}
              className="rounded-xl p-3"
              style={{
                backgroundColor: `${color}14`,
                border: `2px solid ${color}30`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: color,
                    }}
                  />

                  <span className="truncate text-sm font-black text-slate-950">
                    {game.names[player]}
                  </span>
                </div>

                <span
                  className="text-2xl font-black"
                  style={{
                    color,
                  }}
                >
                  {game.scores[player]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* TOTAL WINS */}
      <div className="mb-3 space-y-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">
          Total Wins
        </div>

        {players.map((player) => {
          const color = game.colors[player];

          return (
            <div
              key={player}
              className="rounded-xl p-3"
              style={{
                backgroundColor: `${color}14`,
                border: `2px solid ${color}30`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="flex min-w-0 items-center gap-2 text-sm font-black">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: color,
                    }}
                  />

                  <span className="truncate">
                    {game.names[player]}
                  </span>
                </span>

                <span className="text-2xl font-black text-slate-950">
                  🏆 {game.wins[player]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DRAWS */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black">
            🤝 Draws
          </span>

          <span className="text-2xl font-black">
            {game.draws}
          </span>
        </div>
      </div>

      {/* CURRENT TURN / RESULT */}
      <div
        className="mt-3 rounded-xl px-4 py-3 text-center"
        style={{
          backgroundColor: game.gameOver
            ? "#0f172a"
            : `${game.colors[game.turn]}12`,
          color: game.gameOver
            ? "white"
            : game.colors[game.turn],
        }}
      >
        <div className="text-[9px] font-black uppercase tracking-[0.16em] opacity-70">
          {game.gameOver
            ? "Game Finished"
            : "Current Turn"}
        </div>

        <div className="mt-1 text-sm font-black">
          {game.message}
        </div>
      </div>
    </div>
  );
}