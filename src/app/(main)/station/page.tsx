"use client";

import { useState, useEffect } from "react";
import team from "../team/page";

const API_BASE_URL = "https://skills.coolify.pandasystems.dev/api.php";

type Team = {
  id: number;
  name: string;
  time: string; // MM:SS format
  resultId?: number; // Bruges til DELETE-kald
  seconds: string;
  team_id: number;
  station_id: number;
};

type Class = {
  class_id: string;
  name: string;
  teacher_name: string;
};

type School = {
  school_id: string;
  name: string;
};

type Station = {
  id: string;
  number: string;
  name: string;
};

const normalizeTime = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const hasColon = trimmed.includes(":");
  const numericValue = trimmed.replace(/[^\d:]/g, "");
  if (!numericValue) return "";

  let minutes = "0";
  let seconds = "0";

  if (hasColon) {
    const [left, right = "0"] = trimmed.split(":");
    minutes = left || "0";
    seconds = right || "0";
  } else {
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length <= 2) {
      minutes = digits || "0";
    } else {
      minutes = digits.slice(0, 2);
      seconds = digits.slice(2, 4);
    }
  }

  const minuteValue = Number(minutes);
  const secondValue = Number(seconds);

  if (minuteValue > 59 || secondValue > 59) return "";

  return `${String(minuteValue).padStart(2, "0")}:${String(secondValue).padStart(2, "0")}`;
};

// Hjælpefunktion til konvertering mellem MM:SS og sekunder
const timeToSeconds = (timeStr: string): number => {
  const [min, sec] = timeStr.split(":").map(Number);
  return (min || 0) * 60 + (sec || 0);
};

const secondsToTime = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function StationPage() {
  const [teamTimes, setTeamTimes] = useState<Team[]>([]);
  const [draftTimes, setDraftTimes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<Class | null>(null);
  const [classId, setClassId] = useState<number>(1);
  const [timeData, setTimeData] = useState<Team[]>([]);

  // 1. GET: Hent hold og eksisterende resultater fra API
  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true);
        // Hent hold for klasse 1
        const res = await fetch(`${API_BASE_URL}/teams?class_id=${classId}`);
        const data = await res.json();

        // Transformér data til lokal state
        const loadedTeams = data.map((item: any) => ({
          id: item.id || item.team_id,
          name: item.name || `Hold ${item.team_number || item.id}`,
          time: item.seconds ? secondsToTime(item.seconds) : "",
          resultId: item.result_id,
        }));

        setTeamTimes(loadedTeams);
      } catch (err) {
        console.error("Fejl ved hentning af hold:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchClass() {
      try {
        const res = await fetch(`${API_BASE_URL}/classes/${classId}`);
        const data = await res.json();
        setClassData(data);
      } catch (err) {
        console.error("Fejl ved hentning af klasse:", err);
      }
    }

    async function fetchTime() {
      try {
        const res = await fetch(`${API_BASE_URL}/classes?class_id=${classId}`);
        const data = await res.json();
        setTimeData(data);
      } catch (err) {
        console.error("Fejl ved hentning af tider:", err);
      }
    }

    async function fetchData() {
      await Promise.all([fetchTeams(), fetchClass(), fetchTime()]); 
    }

    fetchData();
  }, [classId]);

  const updateTime = (id: number, time: string) => {
    setDraftTimes((current) => ({
      ...current,
      [id]: time.slice(0, 5),
    }));
  };

  // 2. POST: Gem tid til API (/results)
  const saveTime = async (id: number) => {
    const draft = normalizeTime(draftTimes[id] ?? "");
    if (!draft) return;

    const seconds = timeToSeconds(draft);

    try {
      const res = await fetch(`${API_BASE_URL}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: id,
          station_id: 15, // Station/post id
          seconds: seconds,
        }),
      });

      const responseData = await res.json();

      setTeamTimes((current) =>
        current.map((team) =>
          team.id === id
            ? { ...team, time: draft, resultId: responseData.id }
            : team
        )
      );

      setDraftTimes((current) => ({
        ...current,
        [id]: "",
      }));
    } catch (err) {
      console.error("Fejl ved gemning af tid:", err);
    }
  };

  // 3. DELETE: Fjern tid via API (/results/{id})
  const deleteTime = async (id: number) => {
    const targetTeam = teamTimes.find((t) => t.id === id);

    if (targetTeam?.resultId) {
      try {
        await fetch(`${API_BASE_URL}/results/${targetTeam.resultId}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Fejl ved sletning af tid:", err);
      }
    }

    setTeamTimes((current) =>
      current.map((team) =>
        team.id === id ? { ...team, time: "", resultId: undefined } : team
      )
    );

    setDraftTimes((current) => ({
      ...current,
      [id]: "",
    }));
  };

  TimeLog();

  const completed = teamTimes.filter((team) => team.time !== "");

  const bestTime = completed.length > 0 ? completed.reduce((best, current) => {return current.time < best.time ? current : best;}): null;

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-62.5 shrink-0 border-r border-border bg-background-secondary p-4 md:flex md:flex-col">
          <div className="mb-8 flex items-center gap-3 px-3 py-3">
            <div>
              <div className="font-bold tracking-wide">VESTSKOLEN</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          {/* TOPBAR */}
          <header className="flex h-18.5 items-center justify-between border-b border-border bg-box-background/80 px-5 md:px-9">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-light font-bold text-green-dark">
                F
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-semibold">Værksted</div>
                <div className="text-xs text-secondary">flemming</div>
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-350 p-5 md:p-9">
            {/* HEADER */}
            <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue-background text-2xl">
                  🔧
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Værksted</h1>
                  <p className="mt-1 text-sm text-secondary">
                    Registrer tider for holdene på denne post
                  </p>
                </div>
              </div>
            </div>

            {/* TOP CARDS */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <StatCard title="Klasse" value={classData?.name || "Ikke tilgængelig"} description={classData?.teacher_name || "Ikke tilgængelig"} />
              <StatCard
                title="Hold"
                value={`${completed.length} / ${teamTimes.length}`}
                description="Tider registreret"
              />
            </div>

            {/* MAIN GRID */}
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              {/* TEAMS */}
              <section className="overflow-hidden rounded-2xl border border-border bg-box-background">
                <div className="flex items-center justify-between border-b border-border px-6 py-5">
                  <div>
                    <h2 className="font-bold">Hold & tider</h2>
                    <p className="mt-1 text-xs text-secondary">
                      Registrer den tid hvert hold bruger på værkstedet
                    </p>
                  </div>
                  <div className="rounded-lg bg-accent-blue-background px-3 py-2 text-xs">
                     POST 3
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {loading ? (
                    <div className="p-6 text-center text-secondary">Henter data...</div>
                  ) : (
                    teamTimes
                    .filter(team=> team.station_id=15)
                    .map((team) => (
                      <div
                        key={team.id}
                        className="flex flex-col gap-4 px-6 py-5 transition hover:bg-primary/60 sm:flex-row sm:items-center sm:justify-between"
                      >
                        {/* TEAM */}
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-id-nr-background text-sm font-bold text-id-nr">
                            {team.id}
                          </div>
                          <div>
                            <div className="font-semibold">{team.name}</div>
                            <div className="mt-1 text-xs text-secondary">
                              {team.time ? "Tid registreret" : "Ingen tid registreret"}
                            </div>
                          </div>
                        </div>

                        {/* TIME */}
                        <div className="flex items-center gap-3">
                          {team.time ? (
                            <>
                              <div className="rounded-xl border border-green-dark bg-success-background px-5 py-3 font-mono text-lg font-bold text-success" onClick={() => updateTime(team.id, team.time)}>
                                {team.time}
                              </div>

                              <button
                                onClick={() => deleteTime(team.id)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-background text-danger transition hover:bg-danger hover:text-primary"
                                title="Slet tid"
                              >
                                ×
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="MM:SS"
                                value={draftTimes[team.id] ?? ""}
                                maxLength={5}
                                onChange={(e) => updateTime(team.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveTime(team.id);
                                }}
                                className="w-28 rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-lg text-primary outline-none transition placeholder:text-[#525977] focus:border-green"
                              />

                              <button
                                type="button"
                                onClick={() => saveTime(team.id)}
                                className="rounded-xl bg-green-light px-4 py-3 font-semibold text-green-dark transition hover:bg-hover-bg"
                              >
                                Gem
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* RIGHT COLUMN */}
              <aside className="space-y-5">
                <div className="rounded-2xl border border-border bg-box-background p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        klassen Bedste hold resultat
                      </div>
                      <div className="mt-1 text-lg font-bold">
                        Post 3
                      </div>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-background text-xl">
                      🏆
                    </div>
                  </div>
                  <div className="text-4xl font-black text-warning">
                    {bestTime?.time || "--:--"}
                  </div>
                  <div className="mt-2 text-sm text-secondary">
                    {bestTime?.name || "Ingen registreret endnu"}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-box-background p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="font-bold">Om posten</h3>
                  </div>
                  <p className="text-sm leading-6 text-secondary">
                    På værkstedet skal eleverne gennemføre opgaven hurtigst muligt.
                    Registrer tiden efter hvert hold har afsluttet posten.
                  </p>
                </div>
              </aside>
            </div>

            {/* NAVIGATION */}
            <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
              <button className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary" onClick={() => {if (classId > 1) { setClassId(classId - 1); }}}>
                ← Forrige klasse
              </button>
              <button className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary" onClick={() => {setClassId(classId + 1);}}>
                Næste klasse →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  function TimeLog() {
    if (timeData.length > 0)
      console.log("timeData", timeData[0].seconds);
  }
}

function StatCard({
  title,
  value,
  description,
  highlight = false,
}: {
  title: string;
  value: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-box-background p-5 ${
        highlight ? "border-warning/30" : ""
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
        {title}
      </div>
      <div
        className={`mt-2 text-2xl font-black ${
          highlight ? "text-warning" : "text-primary"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-secondary">{description}</div>
    </div>
  );
}