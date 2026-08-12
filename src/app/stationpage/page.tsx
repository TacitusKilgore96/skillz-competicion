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
        <aside className="hidden w-62.5 shrink-0 border-r border-border bg-box-background p-4 md:flex md:flex-col">

          {/* Logo */}
          <div className="mb-8 flex items-center gap-3 px-3 py-3">
            

            <div>
              <div className="font-bold tracking-wide">
                VESTSKOLEN
              </div>
            </div>
          </div>

      

          <div className="mt-auto border-t border-border pt-4">
            <NavItem
              icon="⚙"
              label="Indstillinger"
            />

            <NavItem
              icon="?"
              label="Hjælp"
            />
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">

          {/* TOPBAR */}
          <header className="flex h-18.5 items-center justify-between border-b border-border bg-box-background/80 px-5 md:px-9">

            <div className="text-sm text-secondary">
              <span>Vestskolen</span>
              <span className="mx-2">/</span>
              <span>8.A</span>
              <span className="mx-2">/</span>
              <strong className="text-primary">
                Post 3
              </strong>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold">
                  Værksted
                </div>
                <div className="text-xs text-secondary">
                  Lærer
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-light font-bold text-bg-primary">
                
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



            {/* NAVIGATION */}
            <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">

              <button className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary">
                ← Forrige klasse
              </button>

              <button className="rounded-xl bg-green-lightpx-5 py-3 text-sm font-bold text-bg-primary transition hover:bg-hover-bg">
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