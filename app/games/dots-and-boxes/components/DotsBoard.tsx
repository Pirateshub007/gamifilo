"use client";

import type {
  GameState,
  Player,
} from "./DotsGame";

type Props = {
  game: GameState;
  onMove: (
    type: "horizontal" | "vertical",
    row: number,
    col: number
  ) => void;
};

export default function DotsBoard({
  game,
  onMove,
}: Props) {
  const size = game.size;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[760px]">
      {/* HORIZONTAL LINES */}
      {Array.from({
        length: size + 1,
      }).map((_, row) =>
        Array.from({
          length: size,
        }).map((_, col) => {
          const owner =
            game.horizontal[row][col];

          return (
            <button
              key={`h-${row}-${col}`}
              aria-label="Horizontal line"
              disabled={Boolean(owner) || game.gameOver}
              onClick={() =>
                onMove(
                  "horizontal",
                  row,
                  col
                )
              }
              className="absolute z-10 -translate-y-1/2 rounded-full transition-all duration-150 hover:scale-y-125 disabled:cursor-default"
              style={{
                left: `${(col / size) * 100}%`,
                top: `${(row / size) * 100}%`,
                width: `${100 / size}%`,
                height: size >= 12 ? 8 : 12,
                backgroundColor: owner
                  ? game.colors[
                      owner as Player
                    ]
                  : "#94a3b8",
                boxShadow: owner
                  ? `0 0 0 2px ${
                      game.colors[
                        owner as Player
                      ]
                    }33`
                  : "0 1px 2px rgba(15,23,42,0.15)",
              }}
            />
          );
        })
      )}

      {/* VERTICAL LINES */}
      {Array.from({
        length: size,
      }).map((_, row) =>
        Array.from({
          length: size + 1,
        }).map((_, col) => {
          const owner =
            game.vertical[row][col];

          return (
            <button
              key={`v-${row}-${col}`}
              aria-label="Vertical line"
              disabled={Boolean(owner) || game.gameOver}
              onClick={() =>
                onMove(
                  "vertical",
                  row,
                  col
                )
              }
              className="absolute z-10 -translate-x-1/2 rounded-full transition-all duration-150 hover:scale-x-125 disabled:cursor-default"
              style={{
                left: `${(col / size) * 100}%`,
                top: `${(row / size) * 100}%`,
                height: `${100 / size}%`,
                width: size >= 12 ? 8 : 12,
                backgroundColor: owner
                  ? game.colors[
                      owner as Player
                    ]
                  : "#94a3b8",
                boxShadow: owner
                  ? `0 0 0 2px ${
                      game.colors[
                        owner as Player
                      ]
                    }33`
                  : "0 1px 2px rgba(15,23,42,0.15)",
              }}
            />
          );
        })
      )}

      {/* BOXES */}
      {Array.from({
        length: size,
      }).map((_, row) =>
        Array.from({
          length: size,
        }).map((_, col) => {
          const owner =
            game.boxes[row][col];

          if (!owner) return null;

          const name =
            game.names[owner as Player];

          return (
            <div
              key={`box-${row}-${col}`}
              className="pointer-events-none absolute flex items-center justify-center"
              style={{
                left: `${(col / size) * 100}%`,
                top: `${(row / size) * 100}%`,
                width: `${100 / size}%`,
                height: `${100 / size}%`,
              }}
            >
              <div
                className="flex h-[70%] w-[70%] items-center justify-center rounded-lg font-black text-white shadow-md sm:rounded-xl"
                style={{
                  backgroundColor:
                    game.colors[
                      owner as Player
                    ],
                  fontSize:
                    size >= 12
                      ? 7
                      : size >= 8
                      ? 9
                      : 12,
                }}
              >
                {name
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          );
        })
      )}

      {/* DOTS */}
      {Array.from({
        length: size + 1,
      }).map((_, row) =>
        Array.from({
          length: size + 1,
        }).map((_, col) => (
          <span
            key={`dot-${row}-${col}`}
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950 shadow-md"
            style={{
              left: `${(col / size) * 100}%`,
              top: `${(row / size) * 100}%`,
              width: size >= 12 ? 7 : 11,
              height: size >= 12 ? 7 : 11,
            }}
          />
        ))
      )}
    </div>
  );
}