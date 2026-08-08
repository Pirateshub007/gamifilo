"use client";

import Link from "next/link";

export default function DotsAndBoxesPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <header className="mb-10 text-center">
          <div className="mb-2 text-[11px] font-black tracking-[0.3em] text-orange-600">
            GAMIFILO
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Dots & Boxes
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm font-bold text-slate-500 sm:text-base">
            Connect the dots. Complete boxes. Take the win.
          </p>
        </header>

        {/* MODES */}
        <div className="grid gap-5 md:grid-cols-3">

          {/* AI */}
          <Link
            href="/games/dots-and-boxes/ai"
            className="group rounded-[28px] border-2 border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
          >
            <div className="mb-4 text-4xl">🤖</div>

            <h2 className="text-xl font-black">
              AI
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Play against the computer.
            </p>

            <div className="mt-6 rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-black text-white transition group-hover:bg-orange-400">
              Play AI
            </div>
          </Link>

          {/* LOCAL */}
          <Link
            href="/games/dots-and-boxes/local"
            className="group rounded-[28px] border-2 border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
          >
            <div className="mb-4 text-4xl">👥</div>

            <h2 className="text-xl font-black">
              Local Multiplayer
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Play together on the same device.
            </p>

            <div className="mt-6 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition group-hover:bg-slate-800">
              Play Local
            </div>
          </Link>

          {/* ONLINE */}
          <Link
            href="/games/dots-and-boxes/online"
            className="group rounded-[28px] border-2 border-green-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
          >
            <div className="mb-4 text-4xl">🌐</div>

            <h2 className="text-xl font-black">
              Online Multiplayer
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Play with another player online.
            </p>

            <div className="mt-6 rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-black text-white transition group-hover:bg-green-500">
              Play Online
            </div>
          </Link>

        </div>

      </div>
    </main>
  );
}