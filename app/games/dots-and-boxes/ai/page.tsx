"use client";

import { useEffect, useState } from "react";

type Player = 1 | 2;
type LineOwner = 0 | 1 | 2;
type Difficulty = "easy" | "medium" | "hard";

const BOARD_SIZES = [4, 5, 6, 8, 10, 12, 15];

function makeHorizontal(size: number): LineOwner[][] {
  return Array.from({ length: size + 1 }, () =>
    Array(size).fill(0)
  );
}

function makeVertical(size: number): LineOwner[][] {
  return Array.from({ length: size }, () =>
    Array(size + 1).fill(0)
  );
}

function makeBoxes(size: number): number[][] {
  return Array.from({ length: size }, () =>
    Array(size).fill(0)
  );
}

export default function DotsAndBoxesAIPage() {
  const [size, setSize] = useState(4);

  const [difficulty, setDifficulty] =
    useState<Difficulty>("medium");

  const [horizontal, setHorizontal] = useState<LineOwner[][]>(
    makeHorizontal(4)
  );

  const [vertical, setVertical] = useState<LineOwner[][]>(
    makeVertical(4)
  );

  const [boxes, setBoxes] = useState<number[][]>(
    makeBoxes(4)
  );

  const [turn, setTurn] = useState<Player>(1);

  const [scores, setScores] = useState({
    1: 0,
    2: 0,
  });

  const [wins, setWins] = useState({
  1: 0,
  2: 0,
});
const [draws, setDraws] = useState(0);

  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Your turn");

  function resetBoard(newSize = size) {
    setSize(newSize);
    setHorizontal(makeHorizontal(newSize));
    setVertical(makeVertical(newSize));
    setBoxes(makeBoxes(newSize));
    setScores({ 1: 0, 2: 0 });
    setTurn(1);
    setGameOver(false);
    setMessage("Your turn");
  }

  function nextPlayer(player: Player): Player {
    return player === 1 ? 2 : 1;
  }

  function playLine(
    type: "h" | "v",
    row: number,
    col: number
  ) {
    if (gameOver || turn !== 1) return;

    makeMove(type, row, col, 1);
  }

  function makeMove(
    type: "h" | "v",
    row: number,
    col: number,
    player: Player
  ) {
    const newHorizontal = horizontal.map(row =>
      [...row]
    );

    const newVertical = vertical.map(row =>
      [...row]
    );

    const newBoxes = boxes.map(row =>
      [...row]
    );

    // Record WHO drew the line.
    if (type === "h") {
      if (newHorizontal[row][col] !== 0) return;

      newHorizontal[row][col] = player;
    } else {
      if (newVertical[row][col] !== 0) return;

      newVertical[row][col] = player;
    }

    let completed = 0;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const complete =
          newHorizontal[r][c] !== 0 &&
          newHorizontal[r + 1][c] !== 0 &&
          newVertical[r][c] !== 0 &&
          newVertical[r][c + 1] !== 0;

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
      ...scores,
      [player]: scores[player] + completed,
    };

    setHorizontal(newHorizontal);
    setVertical(newVertical);
    setBoxes(newBoxes);
    setScores(newScores);

            const totalBoxes = newBoxes
      .flat()
      .filter(Boolean).length;

    if (totalBoxes === size * size) {
      if (newScores[1] > newScores[2]) {
        setMessage("You win! 🏆");

        setWins(prev => ({
          ...prev,
          1: prev[1] + 1,
        }));
      } else if (newScores[2] > newScores[1]) {
        setMessage("AI wins! 🤖");

        setWins(prev => ({
          ...prev,
          2: prev[2] + 1,
        }));
      } else {
  setMessage("It's a draw! 🤝");

  setDraws(prev => prev + 1);
}

      setGameOver(true);
      return;
    }

    // Completing a box gives the same player another turn.
    if (completed > 0) {
      setTurn(player);

      if (player === 1) {
        setMessage(
          completed === 1
            ? "You completed a box — extra turn!"
            : `You completed ${completed} boxes — extra turn!`
        );
            } else {
  setMessage(
    completed === 1
      ? "AI completed a box — AI goes again!"
      : "AI completed boxes — AI goes again!"
  );
}

return;
}

    const next = nextPlayer(player);

    setTurn(next);

if (next === 1) {
  setMessage("Your turn");
} else {
  setMessage("AI is thinking... 🤖");
}
  }

  function aiMove() {
  if (gameOver || turn !== 2) return;

  const available: {
    type: "h" | "v";
    row: number;
    col: number;
  }[] = [];

  // Horizontal lines
  for (let r = 0; r < size + 1; r++) {
    for (let c = 0; c < size; c++) {
      if (horizontal[r][c] === 0) {
        available.push({
          type: "h",
          row: r,
          col: c,
        });
      }
    }
  }

  // Vertical lines
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size + 1; c++) {
      if (vertical[r][c] === 0) {
        available.push({
          type: "v",
          row: r,
          col: c,
        });
      }
    }
  }

  if (available.length === 0) return;

  function testMove(move: {
    type: "h" | "v";
    row: number;
    col: number;
  }) {
    const testHorizontal =
      horizontal.map(row => [...row]);

    const testVertical =
      vertical.map(row => [...row]);

    if (move.type === "h") {
      testHorizontal[move.row][move.col] = 2;
    } else {
      testVertical[move.row][move.col] = 2;
    }

    let completed = 0;
    let dangerous = 0;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const complete =
          testHorizontal[r][c] !== 0 &&
          testHorizontal[r + 1][c] !== 0 &&
          testVertical[r][c] !== 0 &&
          testVertical[r][c + 1] !== 0;

        if (
          complete &&
          boxes[r][c] === 0
        ) {
          completed++;
        }
      }
    }

    // Check whether this move leaves an almost-complete
    // box for the opponent.
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (boxes[r][c] !== 0) continue;

        const sides =
          Number(testHorizontal[r][c] !== 0) +
          Number(testHorizontal[r + 1][c] !== 0) +
          Number(testVertical[r][c] !== 0) +
          Number(testVertical[r][c + 1] !== 0);

        if (sides === 3) {
          dangerous++;
        }
      }
    }

    return {
      completed,
      dangerous,
    };
  }

  /*
   * EASY
   * Mostly random.
   * It will still take an obvious box sometimes.
   */
  if (difficulty === "easy") {
    const scoringMoves = available.filter(
      move => testMove(move).completed > 0
    );

    const shouldScore =
      scoringMoves.length > 0 &&
      Math.random() < 0.65;

    const pool = shouldScore
      ? scoringMoves
      : available;

    const move =
      pool[
        Math.floor(
          Math.random() * pool.length
        )
      ];

    makeMove(
      move.type,
      move.row,
      move.col,
      2
    );

    return;
  }

  /*
   * MEDIUM
   * Always takes an available box.
   * Otherwise prefers moves that don't immediately
   * give the opponent an easy box.
   */
  if (difficulty === "medium") {
    const scoringMoves = available.filter(
      move => testMove(move).completed > 0
    );

    if (scoringMoves.length > 0) {
      const move =
        scoringMoves[
          Math.floor(
            Math.random() *
              scoringMoves.length
          )
        ];

      makeMove(
        move.type,
        move.row,
        move.col,
        2
      );

      return;
    }

    const safeMoves = available.filter(
      move => testMove(move).dangerous === 0
    );

    const pool =
      safeMoves.length > 0
        ? safeMoves
        : available;

    const move =
      pool[
        Math.floor(
          Math.random() * pool.length
        )
      ];

    makeMove(
      move.type,
      move.row,
      move.col,
      2
    );

    return;
  }

  /*
   * HARD
   * 1. Always completes boxes.
   * 2. Avoids giving away boxes.
   * 3. Among safe moves, prefers moves with
   *    better future board position.
   */

  const scoringMoves = available.filter(
    move => testMove(move).completed > 0
  );

  if (scoringMoves.length > 0) {
    const move =
      scoringMoves[
        Math.floor(
          Math.random() *
            scoringMoves.length
        )
      ];

    makeMove(
      move.type,
      move.row,
      move.col,
      2
    );

    return;
  }

  const evaluated = available.map(move => ({
    move,
    ...testMove(move),
  }));

  const safeMoves = evaluated.filter(
    item => item.dangerous === 0
  );

  const pool =
    safeMoves.length > 0
      ? safeMoves
      : evaluated;

  // Prefer moves creating fewer future dangerous boxes.
  const minimumDanger = Math.min(
    ...pool.map(item => item.dangerous)
  );

  const bestMoves = pool.filter(
    item =>
      item.dangerous === minimumDanger
  );

  const selected =
    bestMoves[
      Math.floor(
        Math.random() *
          bestMoves.length
      )
    ];

  makeMove(
    selected.move.type,
    selected.move.row,
    selected.move.col,
    2
  );
}
    useEffect(() => {
  if (turn !== 2 || gameOver) return;

  const timer = setTimeout(() => {
    aiMove();
  }, 450);

  return () => clearTimeout(timer);
}, [turn, gameOver, horizontal, vertical]);

  return (
    <main className="min-h-screen bg-[#fff3e6] text-slate-950">
      <div className="mx-auto min-h-screen max-w-[1500px] px-3 py-3 sm:px-5 sm:py-5">

        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="mb-1 text-[11px] font-black tracking-[0.3em] text-orange-600">
              GAMIFILO
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
              Dots & Boxes — AI
            </h1>

            <p className="mt-1 hidden text-sm font-bold text-slate-600 sm:block">
  Challenge the AI. Complete more boxes.
</p>

<div className="mt-2 text-xs font-black text-orange-600">
  AI:{" "}
  {difficulty === "easy"
    ? "🟢 Easy"
    : difficulty === "medium"
    ? "🟡 Medium"
    : "🔴 Hard"}
</div>
          </div>

          <button
            onClick={() => resetBoard()}
            className="rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 sm:px-4"
          >
            New Game
          </button>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">

          <section className="min-w-0">

            <div className="mb-3 flex items-center justify-between rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-4 w-4 shrink-0 rounded-full ring-4 ring-orange-100"
                  style={{
                    backgroundColor:
                      turn === 1
                        ? "#f97316"
                        : "#2563eb",
                  }}
                />

                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Current turn
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
                  }).map((_, col) => {
                    const owner =
                      horizontal[row][col];

                    return (
                      <button
                        key={`h-${row}-${col}`}
                        aria-label="Horizontal line"
                        disabled={
                          owner !== 0 ||
                          gameOver ||
                          turn !== 1
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
                            owner === 1
                              ? "#f97316"
                              : owner === 2
                              ? "#2563eb"
                              : "#94a3b8",
                          boxShadow:
                            owner === 1
                              ? "0 0 0 2px #f9731633"
                              : owner === 2
                              ? "0 0 0 2px #2563eb33"
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
                      vertical[row][col];

                    return (
                      <button
                        key={`v-${row}-${col}`}
                        aria-label="Vertical line"
                        disabled={
                          owner !== 0 ||
                          gameOver ||
                          turn !== 1
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
                            owner === 1
                              ? "#f97316"
                              : owner === 2
                              ? "#2563eb"
                              : "#94a3b8",
                          boxShadow:
                            owner === 1
                              ? "0 0 0 2px #f9731633"
                              : owner === 2
                              ? "0 0 0 2px #2563eb33"
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
                              owner === 1
                                ? "#f97316"
                                : "#2563eb",
                            fontSize:
                              size >= 12
                                ? "7px"
                                : size >= 8
                                ? "9px"
                                : "12px",
                          }}
                        >
                          {owner === 1
                            ? "YOU"
                            : "AI"}
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
                          size >= 12 ? 7 : 11,
                        height:
                          size >= 12 ? 7 : 11,
                      }}
                    />
                  ))
                )}
              </div>

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

          <aside className="space-y-3">

            <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-sm">
  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-orange-600">
    Match
  </div>

  <h2 className="mb-4 text-lg font-black">
    Scoreboard
  </h2>

  {/* BOXES — CURRENT GAME */}
  <div className="mb-4">
    <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
      Boxes — Current Game
    </div>

    <div className="space-y-2">
      <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black">
            🟠 You
          </span>

          <span className="text-2xl font-black">
            {scores[1]}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black">
            🔵 AI
          </span>

          <span className="text-2xl font-black">
            {scores[2]}
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* TOTAL WINS — CURRENT SESSION */}
  <div>
    <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
      Total Wins — This Session
    </div>

    <div className="space-y-2">
      <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black">
            🟠 You
          </span>

          <span className="text-2xl font-black">
            {wins[1]}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black">
            🔵 AI
          </span>

          <span className="text-2xl font-black">
            {wins[2]}
          </span>
        </div>
      </div>
    </div>
  </div>
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
  <div className="flex items-center justify-between">
    <span className="text-sm font-black">
      🤝 Draws
    </span>

    <span className="text-2xl font-black">
      {draws}
    </span>
  </div>
</div>
</div>

            <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-sm">
              <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-orange-600">
                Board Size
              </div>

              <div className="grid grid-cols-4 gap-2">
                {BOARD_SIZES.map(boardSize => (
                  <button
                    key={boardSize}
                    onClick={() =>
                      resetBoard(boardSize)
                    }
                    className={
                      size === boardSize
                        ? "rounded-lg bg-orange-500 py-2 text-xs font-black text-white"
                        : "rounded-lg bg-slate-100 py-2 text-xs font-black text-slate-700 hover:bg-slate-200"
                    }
                  >
                    {boardSize}×{boardSize}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
  <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-orange-600">
    AI Difficulty
  </div>

  <div className="grid grid-cols-3 gap-2">
    {[
      {
        id: "easy" as Difficulty,
        label: "Easy",
        emoji: "🟢",
      },
      {
        id: "medium" as Difficulty,
        label: "Medium",
        emoji: "🟡",
      },
      {
        id: "hard" as Difficulty,
        label: "Hard",
        emoji: "🔴",
      },
    ].map(level => (
      <button
        key={level.id}
        onClick={() => {
  setDifficulty(level.id);
  resetBoard();
}}
        className={
          difficulty === level.id
            ? "rounded-lg bg-orange-500 py-2.5 text-xs font-black text-white shadow-sm"
            : "rounded-lg bg-slate-100 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-200"
        }
      >
        {level.emoji} {level.label}
      </button>
    ))}
  </div>
</div>

          </aside>
        </div>
      </div>
    </main>
  );
}