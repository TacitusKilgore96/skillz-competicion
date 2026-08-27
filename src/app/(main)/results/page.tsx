type Result = {
  id: number;
  school: string;
  klasse: string;
  hold: string;
  totalSeconds: number;
  visitedStations: number;
};

const results: Result[] = [
  { id: 1, school: "Vestskolen", klasse: "8.A", hold: "Hold 2", totalSeconds: 320, visitedStations: 3 },
  { id: 2, school: "Østskolen", klasse: "9.A", hold: "Hold 1", totalSeconds: 337, visitedStations: 3 },
  { id: 3, school: "Nordskolen", klasse: "8.B", hold: "Hold 3", totalSeconds: 348, visitedStations: 3 },
  { id: 4, school: "Sydskolen", klasse: "8.A", hold: "Hold 1", totalSeconds: 362, visitedStations: 3 },
  { id: 5, school: "Vestskolen", klasse: "9.B", hold: "Hold 2", totalSeconds: 375, visitedStations: 3 },
  { id: 6, school: "Østskolen", klasse: "8.A", hold: "Hold 3", totalSeconds: 387, visitedStations: 3 },
  { id: 7, school: "Nordskolen", klasse: "9.A", hold: "Hold 2", totalSeconds: 399, visitedStations: 3 },
  { id: 8, school: "Sydskolen", klasse: "9.B", hold: "Hold 1", totalSeconds: 411, visitedStations: 3 },
  { id: 9, school: "Vestskolen", klasse: "8.B", hold: "Hold 4", totalSeconds: 423, visitedStations: 3 },
  { id: 10, school: "Østskolen", klasse: "9.B", hold: "Hold 2", totalSeconds: 434, visitedStations: 3 },
];

const topThreeStyles: Record<number, {
  background: string;
  text: string;
  secondaryText: string;
  number: string;
  emoji: string;
}> = {
  1: {
    background: "bg-gradient-to-r from-[#ffd86e] via-[#f59e0b] to-[#b45309] animate-bounce [animation-duration:2s]",
    text: "text-yellow-950 text-3xl",
    secondaryText: "text-black",
    number: "text-yellow-950",
    emoji: "🏆",
  },
  2: {
    background: "bg-gradient-to-tr from-slate-400 via-white to-slate-200",
    text: "text-slate-900",
    secondaryText: "text-black",
    number: "text-slate-900",
    emoji: "🥈",
  },
  3: {
    background: "bg-gradient-to-r from-[#F3C68F] via-[#CD7F31] to-[#8C4A11]",
    text: "text-orange-950",
    secondaryText: "text-black",
    number: "text-orange-950",
    emoji: "🥉",
  },
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-primary md:px-9">
      <div className="mx-auto max-w-350">
        <div className="mb-6">
          <h1 className="uppercase text-5xl font-extrabold text-center p-5 mb-10">
           🏆 Dagens Vindere 🏆
          </h1>
        <div className="flex items-center justify-center gap-6 mb-15 not-only:">
          <ResultTable
            results={results.slice(0, 3)}
            showAverage={false}
            rowStyles={topThreeStyles}
          />
          <img src="/images/victoryroyale.gif" alt="" className="w-70" />
        </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Top 10 - Samlet Resultater
          </h1>
        </div>


        <section className="overflow-hidden rounded-2xl border border-border bg-box-background">
          <div className="overflow-x-none">
            <div className="grid gap-px bg-border md:grid-cols-2">
              <ResultTable results={results.slice(0, 5)} />
              <ResultTable results={results.slice(5)} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ResultTable({
  results,
  showAverage = true,
  rowStyles,
}: {
  results: Result[];
  showAverage?: boolean;
  rowStyles?: typeof topThreeStyles;
}) {
  const gridColumns = showAverage
    ? "grid-cols-[36px_1.5fr_0.7fr_0.8fr_1fr_1.2fr]"
    : "grid-cols-[36px_1.5fr_0.7fr_0.8fr_1fr]";

  return (

    <div className="min-w-175 bg-box-background">
      <div className={`grid ${gridColumns} gap-3 border-b border-border px-4 py-4 text-xs font-semibold uppercase tracking-wider text-secondary`}>
        <div>#</div>
        <div>Skole</div>
        <div>Klasse</div>
        <div>Hold</div>
        <div>Samlet tid</div>
        {showAverage && <div>Gennemsnit pr. post</div>}
      </div>

      <div className="divide-y divide-border">
        {results.map((result) => {
          const averageSeconds = Math.round(
            result.totalSeconds / result.visitedStations
          );
          const style = rowStyles?.[result.id];

          return (
            <div
              key={result.id}
              className={`grid ${gridColumns} items-center gap-3 px-4 py-4 transition hover:brightness-95 ${style?.background ?? "hover:bg-primary/10"} ${style?.text ?? ""}`}
            >
              <div className={`font-bold ${style?.number ?? "text-warning"}`}>
                {style?.emoji && <span className="mr-1">{style.emoji}</span>}
                {result.id}
              </div>
              <div className="font-semibold">{result.school}</div>
              <div className={style?.secondaryText ?? "text-secondary"}>
                {result.klasse}
              </div>
              <div className={style?.secondaryText ?? "text-secondary"}>
                {result.hold}
              </div>
              <div className="font-mono font-bold">
                {formatDuration(result.totalSeconds)}
              </div>
              {showAverage && (
                <div className={`font-mono ${style?.secondaryText ?? "text-secondary"}`}>
                  {formatDuration(averageSeconds)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}