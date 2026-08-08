"use client";

import Link from "next/link";

export default function TicTacToeMenu() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080b16",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {/* TITLE */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "10px",
          }}
        >
          🎮
        </div>

        <h1
          style={{
            margin: 0,
            color: "#00bfff",
            fontSize: "clamp(32px, 8vw, 56px)",
            fontWeight: "900",
          }}
        >
          TIC TAC TOE
        </h1>

        <p
          style={{
            marginTop: "12px",
            color: "#94a3b8",
            fontSize: "17px",
          }}
        >
          Choose how you want to play
        </p>
      </div>

      {/* MODES */}

      <div
        style={{
          width: "min(92vw, 700px)",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "18px",
        }}
      >
        {/* LOCAL */}

        <Link
          href="/games/tic-tac-toe/local"
          style={{
            textDecoration: "none",
            color: "white",
          }}
        >
          <div
            style={{
              padding: "26px 20px",
              borderRadius: "18px",
              background: "#111722",
              border: "2px solid #00bfff",
              textAlign: "center",
              boxShadow: "0 0 20px #00bfff22",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: "40px" }}>
              🎮
            </div>

            <h2
              style={{
                margin: "12px 0 8px",
                fontSize: "22px",
              }}
            >
              Local Multiplayer
            </h2>

            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                lineHeight: 1.5,
              }}
            >
              Play against a friend on the same device.
            </p>

            <div
              style={{
                marginTop: "18px",
                display: "inline-block",
                padding: "9px 16px",
                borderRadius: "9px",
                background: "#00bfff",
                color: "#061018",
                fontWeight: "bold",
              }}
            >
              Play →
            </div>
          </div>
        </Link>

        {/* AI */}

        <Link
          href="/games/tic-tac-toe/ai"
          style={{
            textDecoration: "none",
            color: "white",
          }}
        >
          <div
            style={{
              padding: "26px 20px",
              borderRadius: "18px",
              background: "#111722",
              border: "2px solid #b026ff",
              textAlign: "center",
              boxShadow: "0 0 20px #b026ff22",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: "40px" }}>
              🤖
            </div>

            <h2
              style={{
                margin: "12px 0 8px",
                fontSize: "22px",
              }}
            >
              Play vs AI
            </h2>

            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                lineHeight: 1.5,
              }}
            >
              Challenge the computer with different difficulty levels.
            </p>

            <div
              style={{
                marginTop: "18px",
                display: "inline-block",
                padding: "9px 16px",
                borderRadius: "9px",
                background: "#b026ff",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Play →
            </div>
          </div>
        </Link>

        {/* ONLINE */}

        <Link
          href="/games/tic-tac-toe/online"
          style={{
            textDecoration: "none",
            color: "white",
          }}
        >
          <div
            style={{
              padding: "26px 20px",
              borderRadius: "18px",
              background: "#111722",
              border: "2px solid #00ff88",
              textAlign: "center",
              boxShadow: "0 0 20px #00ff8822",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: "40px" }}>
              🌐
            </div>

            <h2
              style={{
                margin: "12px 0 8px",
                fontSize: "22px",
              }}
            >
              Online Multiplayer
            </h2>

            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                lineHeight: 1.5,
              }}
            >
              Play with another player online.
            </p>

            <div
              style={{
                marginTop: "18px",
                display: "inline-block",
                padding: "9px 16px",
                borderRadius: "9px",
                background: "#00ff88",
                color: "#06120c",
                fontWeight: "bold",
              }}
            >
              Play →
            </div>
          </div>
        </Link>
      </div>

      {/* BACK */}

      <Link
        href="/#games"
        style={{
          marginTop: "36px",
          color: "#64748b",
          textDecoration: "none",
        }}
      >
        ← Back to Games
      </Link>
    </main>
  );
}