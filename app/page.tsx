import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Welcome to
        </p>

        <h1 className="text-6xl font-black tracking-tight sm:text-8xl">
          GAMIFILO
        </h1>

       <p className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
  Play fun browser games. Challenge friends. More games coming soon.
</p>

        <a
          href="#games"
          className="mt-10 rounded-xl bg-cyan-500 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          Explore Games
        </a>
      </section>

      <section id="games" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Games
          </p>
          <h2 className="mt-2 text-4xl font-black">Choose your game</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-500">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
              🎯
            </div>

            <h3 className="text-2xl font-bold">Dots & Boxes</h3>

            <p className="mt-2 text-slate-400">
  Connect the dots, complete boxes, and outsmart your opponent.
</p>

<div className="mt-4 flex flex-col gap-2 text-sm">
  <span className="inline-flex w-fit rounded-full bg-green-500/15 px-3 py-1 text-green-400">
    🤖 AI (single player) | 👥 Local multiplayer | 🌐 Online multiplayer
  </span>
</div>

            <Link
              href="/games/dots-and-boxes"
              className="mt-6 inline-block rounded-lg bg-cyan-500 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-400"
            >
              Play →
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-500">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
              ❌
            </div>

            <h3 className="text-2xl font-bold">Tic Tac Toe</h3>

            <p className="mt-2 text-slate-400">
              Classic Tic Tac Toe with Local, AI, and Online multiplayer modes.
            </p>

            <div className="mt-4 flex flex-col gap-2 text-sm">
              <span className="inline-flex w-fit rounded-full bg-green-500/15 px-3 py-1 text-green-400">
                🤖 AI (single player) | 👥 Local multiplayer | 🌐 Online multiplayer
              </span>
            </div>

            <Link
              href="/games/tic-tac-toe"
              className="mt-6 inline-block rounded-lg bg-cyan-500 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-400"
            >
              Play →
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 opacity-60">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
              🐍
            </div>

            <h3 className="text-2xl font-bold">Snake</h3>

            <p className="mt-2 text-slate-400">
              Coming soon.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 opacity-60">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
              🏏
            </div>

            <h3 className="text-2xl font-bold">Cricket</h3>

            <p className="mt-2 text-slate-400">
              Coming soon.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950 py-20">
  <div className="mx-auto max-w-4xl px-6 text-center">
    <h2 className="text-3xl font-bold">
      Why Gamifilo?
    </h2>

    <p className="mt-6 text-lg text-slate-400">
      Free browser games that work instantly with no downloads.
      Play anytime, anywhere.
      
      More exciting games and multiplayer features are coming soon.
    </p>
  </div>
</section>

      <footer className="border-t border-slate-800 py-10">
  <div className="mx-auto max-w-6xl px-6 text-center">

    <p className="text-slate-400">
      Gamifilo © 2026
    </p>

    <p className="mt-2 text-sm text-slate-500">
      Version 1.0
    </p>

    <p className="mt-3 text-xs italic text-slate-600">
      Made with ❤️ by Pranay Maske
    </p>

  </div>
</footer>
    </main>
  );
}