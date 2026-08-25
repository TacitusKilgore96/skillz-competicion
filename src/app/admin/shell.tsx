"use client"

import React, {useEffect, useState} from "react";
import Link from "next/link";
import {cn} from "tailwind-variants";

interface ShellProps {
    pageTitle: string;
    children: React.ReactNode;
    currentPath: string;
}

export function AdminShell({pageTitle, children, currentPath}: ShellProps) {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        // Optional: Update the time every minute
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const dateStr = now ? now.toLocaleDateString('da-DK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '...';

    const timeStr = now ? now.toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit'
    }) : '...';

    return (
        <div className={"flex"}>
            <aside className={"w-60 h-screen bg-sidebar"}>
                <div className={"h-26 border-b border-white/10 flex flex-col justify-center"}>
                    <h1 className={"text-white text-center text-5xl font-bold italic"}>Skillz</h1>
                    <h2 className={"text-slate-300 text-center font-semibold"}>Kontrol Center</h2>
                </div>

                <nav className={"flex flex-col p-4 gap-2 text-center"}>
                    <PathLink label="Dashboard" targetPath="/admin" currentPath={currentPath} />
                    <PathLink label="Events" targetPath="/admin/events" currentPath={currentPath} />
                    <PathLink label="Schools" targetPath="/admin/events" currentPath={currentPath} />
                    <PathLink label="Stationer" targetPath="/admin/stations" currentPath={currentPath} />
                    <PathLink label="Accounts" targetPath="/admin/accounts" currentPath={currentPath} />
                </nav>
            </aside>

            <div className={"w-full"}>
                <header className={"h-26 px-4 py-2 flex justify-evenly items-center border-b border-black/20"}>
                    <h3 className={"font-bold text-2xl uppercase"}>{pageTitle}</h3>

                    <div className={"text-center"}>
                        <p className={"font-medium uppercase"}>{dateStr}</p>
                        <p className={"font-semibold text-xl"}>{timeStr}</p>
                    </div>
                </header>

                {children}
            </div>
        </div>
    )
}

interface PathLinkProps {
    label: string;
    targetPath: string;
    currentPath: string;
}

function PathLink({ label, targetPath, currentPath }: PathLinkProps) {
    const isActive = targetPath === currentPath;

    return (
        <Link href={targetPath} className={cn(
            "text-white hover:text-slate-800 hover:bg-hover p-2 rounded-lg transition-colors",
            isActive ? "font-bold" : ""
        )}>
            {label}
        </Link>
    )
}