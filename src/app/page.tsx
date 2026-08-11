export default function Home() {
  return (
    <main className="min-h-screen bg-[color:var(--background)] px-6 py-12 text-[color:var(--text-primary)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-white/60">
            Skills Competition
          </p>
          <h1 className="text-4xl font-semibold md:text-6xl">
            Route hub
          </h1>
          <p className="max-w-2xl text-base text-white/75 md:text-lg">
            The pages now live in nested folders under <span className="font-mono">src/app</span> so each route can render directly in the browser.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Homepage", "/homepage"],
            ["Team", "/teampage"],
            ["Station", "/stationpage"],
            ["Results", "/resultspage"],
            ["Teacher", "/teacherpage"],
            ["Admin", "/adminpage"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6 transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              <div className="text-lg font-medium">{label}</div>
              <div className="mt-2 text-sm text-white/60">{href}</div>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
