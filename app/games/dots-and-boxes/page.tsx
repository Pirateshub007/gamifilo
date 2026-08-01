"use client";

import { useState } from "react";

type Player = 1 | 2 | 3;

const BOARD_SIZES = [4, 5, 6, 8, 10, 12, 15];

const COLORS = [
  "#f97316",
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#db2777",
];

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

export default function DotsAndBoxesPage() {
  const [size, setSize] = useState(4);
  const [playerCount, setPlayerCount] = useState(2);

  const [names, setNames] = useState<Record<Player, string>>({
    1: "Player 1",
    2: "Player 2",
    3: "Player 3",
  });

  const [colors, setColors] = useState<Record<Player, string>>({
    1: "#f97316",
    2: "#2563eb",
    3: "#7c3aed",
  });

  const [horizontal, setHorizontal] = useState(
    makeHorizontal(4)
  );

  const [vertical, setVertical] = useState(
    makeVertical(4)
  );

  const [boxes, setBoxes] = useState(makeBoxes(4));

  const [turn, setTurn] = useState<Player>(1);

  const [scores, setScores] = useState<Record<Player, number>>({
    1: 0,
    2: 0,
    3: 0,
  });

  const [wins, setWins] = useState<Record<Player, number>>({
    1: 0,
    2: 0,
    3: 0,
  });

  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Player 1 starts");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

  const players: Player[] =
    playerCount === 2 ? [1, 2] : [1, 2, 3];

  function resetBoard(
    newSize = size,
    newPlayerCount = playerCount
  ) {
    setSize(newSize);
    setPlayerCount(newPlayerCount);
    setHorizontal(makeHorizontal(newSize));
    setVertical(makeVertical(newSize));
    setBoxes(makeBoxes(newSize));

    setScores({
      1: 0,
      2: 0,
      3: 0,
    });

    setTurn(1);
    setGameOver(false);
    setMessage(
      names[1].trim()
        ? `${names[1]} starts`
        : "Player 1 starts"
    );
  }

  function nextPlayer(player: Player): Player {
    if (playerCount === 2) {
      return player === 1 ? 2 : 1;
    }

    if (player === 1) return 2;
    if (player === 2) return 3;
    return 1;
  }

  function playLine(
    type: "h" | "v",
    row: number,
    col: number
  ) {
    if (gameOver) return;

    const newHorizontal = horizontal.map(row =>
      [...row]
    );

    const newVertical = vertical.map(row =>
      [...row]
    );

    const newBoxes = boxes.map(row =>
      [...row]
    );

    if (type === "h") {
      if (newHorizontal[row][col]) return;
      newHorizontal[row][col] = true;
    } else {
      if (newVertical[row][col]) return;
      newVertical[row][col] = true;
    }

    let completed = 0;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const complete =
          newHorizontal[r][c] &&
          newHorizontal[r + 1][c] &&
          newVertical[r][c] &&
          newVertical[r][c + 1];

        if (
          complete &&
          newBoxes[r][c] === 0
        ) {
          newBoxes[r][c] = turn;
          completed++;
        }
      }
    }

    setHorizontal(newHorizontal);
    setVertical(newVertical);
    setBoxes(newBoxes);

    const newScores = {
      ...scores,
      [turn]: scores[turn] + completed,
    };

    setScores(newScores);

    const totalBoxes = newBoxes
      .flat()
      .filter(Boolean).length;

    if (totalBoxes === size * size) {
      const highest = Math.max(
        ...players.map(player => newScores[player])
      );

      const winners = players.filter(
        player =>
          newScores[player] === highest
      );

      if (winners.length === 1) {
        const winner = winners[0];

        setWins(old => ({
          ...old,
          [winner]: old[winner] + 1,
        }));

        setMessage(
          `${names[winner]} wins! 🏆`
        );
      } else {
        setMessage("It's a draw! 🤝");
      }

      setGameOver(true);
      return;
    }

    if (completed > 0) {
      setMessage(
        completed === 1
          ? `${names[turn]} completed a box — extra turn!`
          : `${names[turn]} completed ${completed} boxes — extra turn!`
      );
      return;
    }

    const next = nextPlayer(turn);

    setTurn(next);
    setMessage(`${names[next]}'s turn`);
  }

  function updateName(
    player: Player,
    value: string
  ) {
    setNames(old => ({
      ...old,
      [player]: value,
    }));
  }

  function updateColor(
    player: Player,
    value: string
  ) {
    setColors(old => ({
      ...old,
      [player]: value,
    }));
  }

  return (
    <main className="min-h-screen bg-[#fff3e6] text-slate-950">
      <div className="mx-auto min-h-screen max-w-[1500px] px-3 py-3 sm:px-5 sm:py-5">

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

          {/* BOARD */}
          <section className="min-w-0">

            {/* TURN BAR */}
            <div className="mb-3 flex items-center justify-between rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-4 w-4 shrink-0 rounded-full ring-4 ring-slate-100"
                  style={{
                    backgroundColor: colors[turn],
                  }}
                />

                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {gameOver
                      ? "Game finished"
                      : "Current turn"}
                  </div>

                  <div className="truncate text-base font-black sm:text-lg">
                    {message}
                  </div>
                </div>
              </div>

              <div className="hidden rounded-xl bg-orange-50 px-3 py-2 text-right sm:block">
                <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                  Board
                </div>

                <div className="font-black">
                  {size} × {size}
                </div>
              </div>
            </div>

            {/* BOARD CARD */}
            <div className="rounded-[28px] border-2 border-orange-100 bg-white p-3 shadow-[0_12px_40px_rgba(120,53,15,0.10)] sm:p-5">

              <div
                className="relative mx-auto aspect-square w-full"
                style={{
                  maxWidth:
                    size <= 6
                      ? "620px"
                      : size <= 10
                      ? "700px"
                      : "760px",
                }}
              >

                {/* HORIZONTAL LINES */}
                {Array.from({
                  length: size + 1,
                }).map((_, row) =>
                  Array.from({
                    length: size,
                  }).map((_, col) => (
                    <button
                      key={`h-${row}-${col}`}
                      aria-label="Horizontal line"
                      disabled={
                        horizontal[row][col] ||
                        gameOver
                      }
                      onClick={() =>
                        playLine(
                          "h",
                          row,
                          col
                        )
                      }
                      className="absolute z-10 -translate-y-1/2 rounded-full transition-all duration-150 hover:scale-y-125 disabled:cursor-default"
                      style={{
                        left:
                          (col / size) *
                            100 +
                          "%",
                        top:
                          (row / size) *
                            100 +
                          "%",
                        width:
                          100 / size + "%",
                        height:
                          size >= 12 ? 8 : 12,
                        backgroundColor:
                          horizontal[row][col]
                            ? colors[turn]
                            : "#94a3b8",
                        boxShadow:
                          horizontal[row][col]
                            ? `0 0 0 2px ${colors[turn]}33`
                            : "0 1px 2px rgba(15,23,42,0.15)",
                      }}
                    />
                  ))
                )}

                {/* VERTICAL LINES */}
                {Array.from({
                  length: size,
                }).map((_, row) =>
                  Array.from({
                    length: size + 1,
                  }).map((_, col) => (
                    <button
                      key={`v-${row}-${col}`}
                      aria-label="Vertical line"
                      disabled={
                        vertical[row][col] ||
                        gameOver
                      }
                      onClick={() =>
                        playLine(
                          "v",
                          row,
                          col
                        )
                      }
                      className="absolute z-10 -translate-x-1/2 rounded-full transition-all duration-150 hover:scale-x-125 disabled:cursor-default"
                      style={{
                        left:
                          (col / size) *
                            100 +
                          "%",
                        top:
                          (row / size) *
                            100 +
                          "%",
                        height:
                          100 / size + "%",
                        width:
                          size >= 12 ? 8 : 12,
                        backgroundColor:
                          vertical[row][col]
                            ? colors[turn]
                            : "#94a3b8",
                        boxShadow:
                          vertical[row][col]
                            ? `0 0 0 2px ${colors[turn]}33`
                            : "0 1px 2px rgba(15,23,42,0.15)",
                      }}
                    />
                  ))
                )}

                {/* BOXES */}
                {Array.from({
                  length: size,
                }).map((_, row) =>
                  Array.from({
                    length: size,
                  }).map((_, col) => {
                    const owner =
                      boxes[row][col];

                    if (!owner) return null;

                    return (
                      <div
                        key={`box-${row}-${col}`}
                        className="absolute flex items-center justify-center"
                        style={{
                          left:
                            (col / size) *
                              100 +
                            "%",
                          top:
                            (row / size) *
                              100 +
                            "%",
                          width:
                            100 / size + "%",
                          height:
                            100 / size + "%",
                        }}
                      >
                        <div
                          className="flex h-[70%] w-[70%] items-center justify-center rounded-lg font-black text-white shadow-md sm:rounded-xl"
                          style={{
                            backgroundColor:
                              colors[
                                owner as Player
                              ],
                            fontSize:
                              size >= 12
                                ? "7px"
                                : size >= 8
                                ? "9px"
                                : "12px",
                          }}
                        >
                          {names[
                            owner as Player
                          ]
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
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950 shadow-md"
                      style={{
                        left:
                          (col / size) *
                            100 +
                          "%",
                        top:
                          (row / size) *
                            100 +
                          "%",
                        width:
                          size >= 12
                            ? 7
                            : 11,
                        height:
                          size >= 12
                            ? 7
                            : 11,
                      }}
                    />
                  ))
                )}
              </div>

              {/* GAME OVER */}
              {gameOver && (
                <div className="mt-5 rounded-2xl bg-slate-950 px-5 py-4 text-center text-white">
                  <div className="text-2xl">
                    🏆
                  </div>

                  <div className="mt-1 text-lg font-black">
                    {message}
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

          {/* DESKTOP SIDE PANEL */}
          <aside className="hidden space-y-3 lg:block">

            <ScorePanel
              players={players}
              names={names}
              colors={colors}
              scores={scores}
              wins={wins}
              turn={turn}
            />

            <GameControls
              size={size}
              playerCount={playerCount}
              players={players}
              names={names}
              colors={colors}
              updateName={updateName}
              updateColor={updateColor}
              changeSize={newSize =>
                resetBoard(
                  newSize,
                  playerCount
                )
              }
              changePlayerCount={count =>
                resetBoard(size, count)
              }
              setupOpen={setupOpen}
              setSetupOpen={setSetupOpen}
            />
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

              <ScorePanel
                players={players}
                names={names}
                colors={colors}
                scores={scores}
                wins={wins}
                turn={turn}
              />

              <div className="mt-3">
                <GameControls
                  size={size}
                  playerCount={playerCount}
                  players={players}
                  names={names}
                  colors={colors}
                  updateName={updateName}
                  updateColor={updateColor}
                  changeSize={newSize =>
                    resetBoard(
                      newSize,
                      playerCount
                    )
                  }
                  changePlayerCount={count =>
                    resetBoard(size, count)
                  }
                  setupOpen={setupOpen}
                  setSetupOpen={setSetupOpen}
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

function GameControls({
  size,
  playerCount,
  players,
  names,
  colors,
  updateName,
  updateColor,
  changeSize,
  changePlayerCount,
  setupOpen,
  setSetupOpen,
}: {
  size: number;
  playerCount: number;
  players: Player[];
  names: Record<Player, string>;
  colors: Record<Player, string>;
  updateName: (
    player: Player,
    value: string
  ) => void;
  updateColor: (
    player: Player,
    value: string
  ) => void;
  changeSize: (size: number) => void;
  changePlayerCount: (count: number) => void;
  setupOpen: boolean;
  setSetupOpen: (
    open: boolean
  ) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-sm">

      {/* COLLAPSIBLE HEADER */}
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

      {/* SETUP CONTENT */}
      {setupOpen && (
        <div className="mt-4">

          <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
            Players
          </label>

          <div className="mb-4 grid grid-cols-2 gap-2">
            {[2, 3].map(count => (
              <button
                key={count}
                onClick={() =>
                  changePlayerCount(count)
                }
                className={
                  playerCount === count
                    ? "rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-black text-white"
                    : "rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-200"
                }
              >
                {count} Players
              </button>
            ))}
          </div>

          <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
            Board Size
          </label>

          <div className="mb-5 grid grid-cols-4 gap-2">
            {BOARD_SIZES.map(boardSize => (
              <button
                key={boardSize}
                onClick={() =>
                  changeSize(boardSize)
                }
                className={
                  size === boardSize
                    ? "rounded-lg bg-orange-500 py-2 text-xs font-black text-white shadow-sm"
                    : "rounded-lg bg-slate-100 py-2 text-xs font-black text-slate-700 hover:bg-slate-200"
                }
              >
                {boardSize}×{boardSize}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
            Player Names & Colors
          </label>

          <div className="space-y-2">
            {players.map(player => (
              <div
                key={player}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{
                      backgroundColor:
                        colors[player],
                    }}
                  />

                  <span className="text-sm font-black">
                    Player {player}
                  </span>
                </div>

                <input
                  value={names[player]}
                  maxLength={20}
                  onChange={event =>
                    updateName(
                      player,
                      event.target.value
                    )
                  }
                  className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />

                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() =>
                        updateColor(
                          player,
                          color
                        )
                      }
                      aria-label={`Choose color for Player ${player}`}
                      className="h-7 w-7 rounded-full transition hover:scale-110"
                      style={{
                        backgroundColor: color,
                        boxShadow:
                          colors[player] ===
                          color
                            ? "0 0 0 3px white, 0 0 0 5px #0f172a"
                            : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScorePanel({
  players,
  names,
  colors,
  scores,
  wins,
  turn,
}: {
  players: Player[];
  names: Record<Player, string>;
  colors: Record<Player, string>;
  scores: Record<Player, number>;
  wins: Record<Player, number>;
  turn: Player;
}) {
  return (
    <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-sm">

      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">
            Match
          </div>

          <h2 className="text-lg font-black">
            Scoreboard
          </h2>
        </div>

        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500">
          Session
        </span>
      </div>

      <div className="space-y-2">
        {players.map(player => (
          <div
            key={player}
            className={
              player === turn
                ? "rounded-xl border-2 border-orange-200 bg-orange-50 p-3"
                : "rounded-xl border border-slate-100 bg-slate-50 p-3"
            }
          >
            <div className="flex items-center justify-between gap-2">

              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      colors[player],
                  }}
                />

                <span className="truncate text-sm font-black text-slate-950">
                  {names[player]}
                </span>
              </div>

              {player === turn && (
                <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-orange-600">
                  Turn
                </span>
              )}
            </div>

            <div className="mt-2 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-black uppercase text-slate-500">
                  Score
                </div>

                <div className="text-2xl font-black leading-none">
                  {scores[player]}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-slate-500">
                  Wins
                </div>

                <div className="text-lg font-black">
                  🏆 {wins[player]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}