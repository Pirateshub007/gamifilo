"use client";

type Theme = {
  primary: string;
  secondary: string;
  background: string;
};

type BoardProps = {
  board: string[];
  play: (index: number) => void;
  theme: Theme;
};

export default function TicTacToeBoard({
  board,
  play,
  theme,
}: BoardProps) {
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

  const winningLine = winningLines.find(([a, b, c]) => {
    return (
      board[a] !== "" &&
      board[a] === board[b] &&
      board[a] === board[c]
    );
  });

  function center(index: number) {
    return {
      x: (index % 3) * 100 + 50,
      y: Math.floor(index / 3) * 100 + 50,
    };
  }

  return (
    <svg
      viewBox="0 0 300 300"
      width="min(90vw,500px)"
      height="min(90vw,500px)"
      style={{
        background: theme.background,
        borderRadius: "20px",
        boxShadow: `0 0 30px ${theme.primary}`,
        touchAction: "manipulation",
      }}
    >
      {/* GRID */}
      <g
        stroke={theme.primary}
        strokeWidth="8"
        strokeLinecap="round"
        pointerEvents="none"
      >
        <line x1="100" y1="20" x2="100" y2="280" />
        <line x1="200" y1="20" x2="200" y2="280" />
        <line x1="20" y1="100" x2="280" y2="100" />
        <line x1="20" y1="200" x2="280" y2="200" />
      </g>

      {/* X / O + CLICK AREAS */}
      {board.map((cell, i) => {
        const { x, y } = center(i);

        return (
          <g key={i}>
            {cell === "X" && (
              <text
                x={x}
                y={y + 20}
                textAnchor="middle"
                fontSize="70"
                fontWeight="bold"
                fill={theme.primary}
                pointerEvents="none"
              >
                X
              </text>
            )}

            {cell === "O" && (
              <circle
                cx={x}
                cy={y}
                r="30"
                stroke={theme.secondary}
                strokeWidth="8"
                fill="none"
                pointerEvents="none"
              />
            )}

            <rect
              x={(i % 3) * 100}
              y={Math.floor(i / 3) * 100}
              width="100"
              height="100"
              fill="transparent"
              pointerEvents="all"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                play(i);
              }}
            />
          </g>
        );
      })}

      {/* WINNING LINE */}
      {winningLine && (
        <>
          {(() => {
            const start = center(winningLine[0]);
            const end = center(winningLine[2]);

            const color =
              board[winningLine[0]] === "X"
                ? theme.primary
                : theme.secondary;

            return (
              <>
                {/* Glow */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={color}
                  strokeWidth="18"
                  strokeLinecap="round"
                  opacity="0.25"
                  pointerEvents="none"
                />

                {/* Winning line */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={color}
                  strokeWidth="7"
                  strokeLinecap="round"
                  pointerEvents="none"
                />
              </>
            );
          })()}
        </>
      )}
    </svg>
  );
}