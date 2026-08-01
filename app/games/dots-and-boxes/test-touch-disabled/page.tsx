"use client";

export default function TestTouch() {
  return (
    <main className="min-h-screen bg-yellow-200 p-10">
      <h1 className="mb-10 text-3xl font-black">
        TOUCH TEST
      </h1>

      <button
        type="button"
        onClick={() => alert("BUTTON WORKS")}
        className="rounded-2xl bg-red-600 px-10 py-6 text-2xl font-black text-white"
      >
        TAP ME
      </button>
    </main>
  );
}