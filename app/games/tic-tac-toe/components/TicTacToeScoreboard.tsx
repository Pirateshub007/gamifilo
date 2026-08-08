"use client";

type SymbolType = "X" | "O";

type Props = {
  player1Name: string;
  player2Name: string;
  player1Symbol: SymbolType;
  player2Symbol: SymbolType;
  score: {
    X: number;
    O: number;
    draw: number;
  };
  turn: string;
  winner: SymbolType | "draw" | null;
  primary: string;
  secondary: string;
};

export default function TicTacToeScoreboard({
  player1Name,
  player2Name,
  player1Symbol,
  player2Symbol,
  score,
  turn,
  winner,
  primary,
  secondary,
}: Props) {
  const active1 = turn === player1Symbol && !winner;
  const active2 = turn === player2Symbol && !winner;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* COMPACT TOP INFO */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "16px",
          background: "#111722",
          border: `2px solid ${primary}`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            opacity: 0.6,
            fontWeight: "bold",
            letterSpacing: "1.5px",
          }}
        >
          {winner ? "ROUND FINISHED" : "CURRENT TURN"}
        </div>

        <div
          style={{
            marginTop: "3px",
            fontSize: "18px",
            fontWeight: "bold",
            color: primary,
          }}
        >
          {winner === "draw"
            ? "🤝 DRAW"
            : winner
            ? `🏆 ${
                winner === player1Symbol
                  ? player1Name
                  : player2Name
              } WINS`
            : `${turn === "X" ? "❌" : "⭕"} ${
                turn === player1Symbol
                  ? player1Name
                  : player2Name
              }'s Turn`}
        </div>
      </div>

      {/* SCOREBOARD */}
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 70px 1fr",
          gap: "8px",
          alignItems: "stretch",
        }}
      >
        {/* PLAYER 1 */}
        <div
          style={{
            padding: "14px 8px",
            borderRadius: "16px",
            textAlign: "center",
            background: "#111722",
            border: active1
              ? `2px solid ${primary}`
              : "2px solid #303642",
          }}
        >
          <div style={{ fontSize: "18px" }}>
            {player1Symbol === "X" ? "❌" : "⭕"}
          </div>

          <div
            style={{
              marginTop: "3px",
              fontWeight: "bold",
              fontSize: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {player1Name}
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "28px",
              fontWeight: "bold",
              color: primary,
            }}
          >
            {score[player1Symbol]}
          </div>

          <div
            style={{
              fontSize: "9px",
              opacity: 0.55,
              fontWeight: "bold",
            }}
          >
            WINS
          </div>
        </div>

        {/* DRAWS */}
        <div
          style={{
            padding: "14px 4px",
            borderRadius: "16px",
            textAlign: "center",
            background: "#111722",
            border: "2px solid #303642",
          }}
        >
          <div style={{ fontSize: "18px" }}>🤝</div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {score.draw}
          </div>

          <div
            style={{
              fontSize: "9px",
              opacity: 0.55,
              fontWeight: "bold",
            }}
          >
            DRAWS
          </div>
        </div>

        {/* PLAYER 2 */}
        <div
          style={{
            padding: "14px 8px",
            borderRadius: "16px",
            textAlign: "center",
            background: "#111722",
            border: active2
              ? `2px solid ${secondary}`
              : "2px solid #303642",
          }}
        >
          <div style={{ fontSize: "18px" }}>
            {player2Symbol === "X" ? "❌" : "⭕"}
          </div>

          <div
            style={{
              marginTop: "3px",
              fontWeight: "bold",
              fontSize: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {player2Name}
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "28px",
              fontWeight: "bold",
              color: secondary,
            }}
          >
            {score[player2Symbol]}
          </div>

          <div
            style={{
              fontSize: "9px",
              opacity: 0.55,
              fontWeight: "bold",
            }}
          >
            WINS
          </div>
        </div>
      </div>
    </div>
  );
}