export type Player = 1 | 2 | 3;
export type LineOwner = 0 | 1 | 2 | 3;

export type PlayerNames = Record<Player, string>;
export type PlayerColors = Record<Player, string>;
export type PlayerScores = Record<Player, number>;

export type GameState = {
  size: number;
  playerCount: 2 | 3;

  horizontal: LineOwner[][];
vertical: LineOwner[][];
  boxes: number[][];

  turn: Player;

  scores: PlayerScores;
wins: PlayerScores;
draws: number;

names: PlayerNames;
  colors: PlayerColors;

  gameOver: boolean;
  message: string;
};

export const BOARD_SIZES = [4, 5, 6, 8, 10, 12, 15];

export const COLORS = [
  "#f97316",
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#db2777",
];

export const DEFAULT_NAMES: PlayerNames = {
  1: "Player 1",
  2: "Player 2",
  3: "Player 3",
};

export const DEFAULT_COLORS: PlayerColors = {
  1: "#f97316",
  2: "#2563eb",
  3: "#7c3aed",
};

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

function makeBoxes(size: number) {
  return Array.from({ length: size }, () =>
    Array(size).fill(0)
  );
}

export function createGame(
  size = 4,
  playerCount: 2 | 3 = 2,
  names: PlayerNames = DEFAULT_NAMES,
  colors: PlayerColors = DEFAULT_COLORS,
  wins: PlayerScores = {
    1: 0,
    2: 0,
    3: 0,
  },
  draws = 0
): GameState {
  return {
    size,
    playerCount,

    horizontal: makeHorizontal(size),
    vertical: makeVertical(size),
    boxes: makeBoxes(size),

    turn: 1,

    scores: {
      1: 0,
      2: 0,
      3: 0,
    },

    wins: {
  ...wins,
},

draws,

names: {
  ...names,
},

    colors: {
      ...colors,
    },

    gameOver: false,

    message: names[1].trim()
      ? `${names[1]} starts`
      : "Player 1 starts",
  };
}

export function getPlayers(
  playerCount: 2 | 3
): Player[] {
  return playerCount === 2
    ? [1, 2]
    : [1, 2, 3];
}

function nextPlayer(
  player: Player,
  playerCount: 2 | 3
): Player {
  if (playerCount === 2) {
    return player === 1 ? 2 : 1;
  }

  if (player === 1) return 2;
  if (player === 2) return 3;

  return 1;
}

export function makeMove(
  game: GameState,
  type: "horizontal" | "vertical",
  row: number,
  col: number
): GameState {
  if (game.gameOver) {
    return game;
  }

  if (
    type === "horizontal" &&
    game.horizontal[row]?.[col]
  ) {
    return game;
  }

  if (
    type === "vertical" &&
    game.vertical[row]?.[col]
  ) {
    return game;
  }

  const horizontal = game.horizontal.map((r) => [...r]);
  const vertical = game.vertical.map((r) => [...r]);
  const boxes = game.boxes.map((r) => [...r]);

  if (type === "horizontal") {
  horizontal[row][col] = game.turn;
} else {
  vertical[row][col] = game.turn;
}

  let completed = 0;

  for (let r = 0; r < game.size; r++) {
    for (let c = 0; c < game.size; c++) {
      const complete =
        horizontal[r][c] &&
        horizontal[r + 1][c] &&
        vertical[r][c] &&
        vertical[r][c + 1];

      if (complete && boxes[r][c] === 0) {
        boxes[r][c] = game.turn;
        completed++;
      }
    }
  }

  const scores = {
    ...game.scores,
    [game.turn]:
      game.scores[game.turn] + completed,
  };

  const totalBoxes = boxes
    .flat()
    .filter(Boolean).length;

  // ───────── GAME OVER ─────────

  if (totalBoxes === game.size * game.size) {
    const players = getPlayers(game.playerCount);

    const highest = Math.max(
      ...players.map(
        (player) => scores[player]
      )
    );

    const winners = players.filter(
      (player) =>
        scores[player] === highest
    );

    let wins = {
  ...game.wins,
};

let draws = game.draws;

let message = "";

if (winners.length === 1) {
  const winner = winners[0];

  wins[winner]++;

  message = `${game.names[winner]} wins! 🏆`;
} else {
  draws++;

  message = "It's a draw! 🤝";
}

    return {
  ...game,
  horizontal,
  vertical,
  boxes,
  scores,
  wins,
  draws,
  gameOver: true,
  message,
};
  }

  // ───────── EXTRA TURN ─────────

  if (completed > 0) {
    const message =
      completed === 1
        ? `${game.names[game.turn]} completed a box — extra turn!`
        : `${game.names[game.turn]} completed ${completed} boxes — extra turn!`;

    return {
      ...game,
      horizontal,
      vertical,
      boxes,
      scores,
      message,
    };
  }

  // ───────── NEXT PLAYER ─────────

  const next = nextPlayer(
    game.turn,
    game.playerCount
  );

  return {
    ...game,
    horizontal,
    vertical,
    boxes,
    scores,
    turn: next,
    message: `${game.names[next]}'s turn`,
  };
}

export function updatePlayerName(
  game: GameState,
  player: Player,
  name: string
): GameState {
  const names = {
    ...game.names,
    [player]: name,
  };

  return {
    ...game,
    names,
    message: game.gameOver
      ? game.message
      : game.turn === player
      ? `${name || `Player ${player}`} ${
          game.scores[player] > 0
            ? "'s turn"
            : "starts"
        }`
      : game.message,
  };
}

export function updatePlayerColor(
  game: GameState,
  player: Player,
  color: string
): GameState {
  return {
    ...game,
    colors: {
      ...game.colors,
      [player]: color,
    },
  };
}