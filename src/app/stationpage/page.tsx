"use client";

import { useState } from "react";

type Team = {
  id: number;
  name: string;
  time: string;
};

const teams: Team[] = [
  { id: 1, name: "Hold 1", time: "01:35" },
  { id: 2, name: "Hold 2", time: "01:22" },
  { id: 3, name: "Hold 3", time: "" },
  { id: 4, name: "Hold 4", time: "01:48" },
];

export default function StationPage() {
  const [teamTimes, setTeamTimes] = useState(teams);

  const updateTime = (id: number, time: string) => {
    setTeamTimes((current) =>
      current.map((team) =>
        team.id === id ? { ...team, time } : team
      )
    );
  };

  const deleteTime = (id: number) => {
    setTeamTimes((current) =>
      current.map((team) =>
        team.id === id ? { ...team, time: "" } : team
      )
    );
  };

  const completed = teamTimes.filter((team) => team.time !== "");

  const bestTime =
    completed.length > 0
      ? completed.reduce((best, current) => {
          return current.time < best.time ? current : best;
        })
      : null;

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-62.5 shrink-0 border-r border-border bg-background-secondary p-4 md:flex md:flex-col">

          {/* Logo */}
          <div className="mb-8 flex items-center gap-3 px-3 py-3">
            

            <div>
              <div className="font-bold tracking-wide">
                VESTSKOLEN
              </div>
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
                <div className="text-sm font-semibold">
                  Værksted
                </div>
                <div className="text-xs text-secondary">
                  flemming
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
                  🔧
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Værksted
                  </h1>

                  <p className="mt-1 text-sm text-secondary">
                    Registrer tider for holdene på denne post
                  </p>
                </div>

              </div>

            </div>

            {/* TOP CARDS */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <StatCard
                title="Klasse"
                value="8.A"
                description="Vestskolen"
              />

              <StatCard
                title="Post"
                value="3"
                description="Værksted"
              />

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
                    <h2 className="font-bold">
                      Hold & tider
                    </h2>

                    <p className="mt-1 text-xs text-secondary">
                      Registrer den tid hvert hold bruger på værkstedet
                    </p>
                  </div>

                  <div className="rounded-lg bg-accent-blue-background  px-3 py-2 text-xs bg-accent-blue-">
                    POST 3
                  </div>

                </div>

                <div className="divide-y divide-border">

                  {teamTimes.map((team) => (

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
                          <div className="font-semibold">
                            {team.name}
                          </div>

                          <div className="mt-1 text-xs text-secondary">
                            {team.time
                              ? "Tid registreret"
                              : "Ingen tid registreret"}
                          </div>
                        </div>

                      </div>

                      {/* TIME */}
                      <div className="flex items-center gap-3">

                        {team.time ? (
                          <>
                            <div className="rounded-xl border border-green-dark bg-success-background px-5 py-3 font-mono text-lg font-bold text-success">
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
                              placeholder="00:00"
                              maxLength={5}
                              onChange={(e) =>
                                updateTime(team.id, e.target.value)
                              }
                              className=" w-28 rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-lg text-primary outline-none transition placeholder:text-[#525977] focus:border-green
                              "
                            />

                            <button
                              className="rounded-xl bg-green-lightpx-4 py-3 font-semibold text-green-dark transition hover:bg-hover-bg
                              "
                            >
                              Gem
                            </button>

                          </div>
                        )}

                      </div>

                    </div>

                  ))}

                </div>

              </section>

              {/* RIGHT COLUMN */}
              <aside className="space-y-5">

                {/* BEST TIME */}
                <div className="rounded-2xl border border-border bg-box-background p-6">

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        Bedste resultat
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

                {/*  INFO 
                <div className="rounded-2xl border border-border bg-box-background p-6">

                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue-background  bg-accent-blue-">
                      i
                    </div>

                    <h3 className="font-bold">
                      Om posten
                    </h3>
                  </div>

                  <p className="text-sm leading-6 text-secondary">
                    På værkstedet skal eleverne gennemføre opgaven
                    hurtigst muligt. Registrer tiden efter hvert hold
                    har afsluttet posten.
                  </p>

                </div> */}

              </aside>

            </div>

            {/* NAVIGATION */}
            <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">

              <button className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary">
                ← Forrige klasse
              </button>

              <button className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary ">
                Næste klasse →
              </button>

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