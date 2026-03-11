export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">You are offline</h1>
        <p className="text-slate-600 mb-6">
          Internet connection is unavailable right now. Reconnect and try again.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2 text-white font-medium hover:bg-cyan-700 transition-colors"
        >
          Retry
        </a>
      </div>
    </main>
  );
}
