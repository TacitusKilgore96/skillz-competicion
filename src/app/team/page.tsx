"use client";

import { useState } from "react";

type Class = {
  id: number;
  name: string;
  teams: Team[];
};

type Team = {
  id: number;
  name: string;
  visited: boolean;
  duration: string;
};

const teams: Team[] = [
  { id: 1, name: "Madlavning", visited: true, duration: "01:35" },
  { id: 2, name: "Medie", visited: true, duration: "01:22" },
  { id: 3, name: "Træværksted", visited: false, duration: "--:--" },
  { id: 4, name: "Teknik", visited: true, duration: "01:48" },
  { id: 5, name: "Førstehjælp", visited: false, duration: "--:--" },
  { id: 6, name: "IT", visited: true, duration: "01:41" },
  { id: 7, name: "Design", visited: true, duration: "01:38" },
  { id: 8, name: "Service", visited: true, duration: "01:28" },
  { id: 9, name: "Natur & Miljø", visited: true, duration: "01:18" },
  { id: 10, name: "Innovation", visited: true, duration: "01:58" }
];

const teamBadgeIcons: Record<number, string> = {
  1: "/images/mortar-pestle-solid-full.svg",
  2: "/images/camera-regular-full.svg",
  3: "/images/hammer-solid-full.svg",
  4: "/images/gear-solid-full.svg",
  5: "/images/briefcase-medical-solid-full.svg",
  6: "/images/laptop-solid-full.svg",
  7: "/images/pencil-solid-full.svg",
  8: "/images/people-group-solid-full.svg",
  9: "/images/leaf-solid-full.svg",
  10: "/images/lightbulb-solid-full.svg",
};

export default function team() {
  const [teamStatuses, setTeamStatuses] = useState(teams);

  const toggleVisit = (id: number) => {
    setTeamStatuses((current) =>
      current.map((team) =>
        team.id === id ? { ...team, visited: !team.visited } : team
      )
    );
  };

  const visitedCount = teamStatuses.filter((team) => team.visited).length;

  const validDurations = teamStatuses
    .filter((team) => team.visited && team.duration && team.duration !== "--:--")
    .map((team) => {
      const [minutes, seconds] = team.duration.split(":").map(Number);
      return minutes * 60 + seconds;
    });

  const averageDurationSeconds =
    validDurations.length > 0
      ? Math.round(
          validDurations.reduce((sum, value) => sum + value, 0) /
            validDurations.length
        )
      : 0;

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const bestDuration=
  validDurations.length > 0
  ? Math.min(...validDurations)
  : 0;

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="flex min-h-screen">

        

        {/* MAIN */}
        <main className="min-w-0 flex-1">

          {/* TOPBAR */}
          <header className="flex h-18.5 items-center justify-between border-b border-border bg-box-background/80 px-5 md:px-9">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-light font-bold text-green-dark">
                f
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-semibold">
                  Hold
                </div>
                <div className="text-xs text-secondary">
                  Flemming
                </div>
              </div>

            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-350 p-5 md:p-9">

            {/* HEADER */}
            <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue-background text-2xl bg-accent-blue-">
                  📈
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Hold
                  </h1>

                  <p className="mt-1 text-sm text-secondary">
                    Overblik over resultater
                  </p>
                </div>

              </div>

            </div>

            {/* TOP CARDS */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <StatCard
                title="Jeres Samlede Tid"
                value="5:20"
                description="mm:ss"
              />

              <StatCard
                title="Gennemsnit Pr. Post"
                value={formatDuration(averageDurationSeconds)}
                description="mm:ss"
              />

              <StatCard
              title="Bedste Tid"
              value={validDurations.length > 0 ? formatDuration(bestDuration) : "--:--"}
              description="mm:ss"
              />

            </div>

            {/* MAIN GRID */}
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">

              {/* TEAMS */}
              <section className="overflow-hidden rounded-2xl border border-border bg-box-background">

                <div className="flex items-center justify-between border-b border-border px-6 py-5">

                  <div>
                    <h2 className="font-bold">
                      Jeres resultater
                    </h2>

                    <p className="mt-1 text-xs text-secondary">
                      Her kan I se jeres tider på alle poster
                    </p>
                  </div>


                </div>

                <div className="divide-y divide-border overflow-scroll h-120">

                  {teamStatuses.map((team) => (

                    <div
                      key={team.id}
                      className="flex flex-col gap-4 px-6 py-5 transition hover:bg-primary/60 sm:flex-row sm:items-center sm:justify-between"
                    >

                      {/* TEAM */}
                      <div className="flex items-center gap-4">

                        <div className="min-w-8 text-left text-xl font-bold text-primary">
                          {team.id}
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-id-nr-background text-sm font-bold text-id-nr">
                          {teamBadgeIcons[team.id] ? (
                            <img
                              src={teamBadgeIcons[team.id]}
                              alt={`Hold ${team.id}`}
                              className="h-7 w-7 object-contain"
                            />
                          ) : (
                            team.id
                          )}
                        </div>

                        <div>
                          <div className="font-semibold">
                            {team.name}
                          </div>

                          <div className="mt-1 text-xs text-secondary">
                            {team.visited ? "Besøgt stationen" : "Har ikke besøgt stationen"}
                          </div>
                        </div>

                      </div>

                      {/* STATUS */}
                      <div className="flex items-center gap-3">
                        <div className="min-w-[72px] text-left font-mono text-base font-bold text-primary">
                          {team.visited ? team.duration : "--:--"}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleVisit(team.id)}
                          className={
                            team.visited
                              ? "rounded-xl border border-green-dark bg-success-background px-4 py-2.5 text-sm font-semibold text-success transition hover:opacity-90"
                              : "rounded-xl border border-red-500 bg-danger-background px-4 py-2.5 text-sm font-semibold text-danger transition hover:opacity-90"
                          }
                        >
                          {team.visited ? "Besøgt" : "Ikke besøgt"}
                        </button>
                      </div>

                    </div>

                  ))}

                </div>

              </section>

              {/* RIGHT COLUMN */}
              <aside className="space-y-5">

                {/* VISIT STATUS */}
                <div className="rounded-2xl border border-border bg-box-background p-6">

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        Besøgstatus
                      </div>

                      <div className="mt-1 text-lg font-bold">
                        Poster
                      </div>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-dark text-xl">
                      ✅
                    </div>

                  </div>

                  <div className="text-4xl font-black text-warning">
                    {visitedCount}
                  </div>

                  <div className="mt-2 text-s text-secondary">
                    {visitedCount} / {teamStatuses.length} Poster er besøgt
                  </div>

                </div>

                <div className="rounded-2xl border border-border bg-box-background p-6">

                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="font-bold">
                      Om posten
                    </h3>
                  </div>

                  <p className="text-s leading-6 text-secondary">
                    Her markerer holdet, om de har besøgt posten eller ej.
                    Statusen bruges til at holde styr på, hvilke grupper der
                    er nået frem til stationen.
                  </p>

                </div>

              </aside>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}


/* =========================
   COMPONENTS
========================= */

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`
        flex items-center gap-3 rounded-xl px-3 py-3
        text-sm transition
        ${
          active
            ? "bg-green text-white"
            : "text-secondary hover:bg-primary hover:text-primary"
        }
      `}
    >
      <span className="w-6 text-center text-base">
        {icon}
      </span>

      {label}
    </a>
  );
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
      className={`
        rounded-2xl
        border border-border
        bg-box-background
        p-5
        ${highlight ? "border-warning/30" : ""}
      `}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
        {title}
      </div>

      <div
        className={`
          mt-2 text-2xl font-black
          ${highlight ? "text-warning" : "text-primary"}
        `}
      >
        {value}
      </div>

      <div className="mt-1 text-xs text-secondary">
        {description}
      </div>
    </div>
  );
}