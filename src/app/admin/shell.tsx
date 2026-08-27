"use client"

import React, {useEffect, useState} from "react";
import Link from "next/link";
import {cn} from "tailwind-variants";
import {usePathname} from "next/navigation";

interface ShellProps {
	pageTitle: string;
	children: React.ReactNode;
}

export function EventShell({pageTitle, children}: ShellProps) {
	const [now, setNow] = useState<Date>(() => new Date());

	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 60000);
		return () => clearInterval(timer);
	}, []);

	const dateStr = now.toLocaleDateString('da-DK', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const timeStr = now.toLocaleTimeString('da-DK', {
		hour: '2-digit',
		minute: '2-digit'
	});

	return (
		<div className={"flex h-screen w-full"}>
			<aside className={"w-60 shrink-0 bg-sidebar flex flex-col overflow-y-scroll"}>
				<div className={"h-26 border-b border-white/10 shrink-0 flex flex-col justify-center"}>
					<h1 className={"text-white text-center text-5xl font-bold"}>Skills</h1>
					<h2 className={"text-slate-300 text-center font-semibold"}>Kontrol Center</h2>
				</div>

				<nav className={"p-4 gap-2 text-center flex-1"}>
					<PathLink label="Oversigt" href="" pathRegex={/^$/}/>
					<PathLink label="Skoler" href="schools" pathRegex={/^schools/}/>
					<PathLink label="Klasser" href="classes" pathRegex={/^classes/}/>
					<PathLink label="Hold" href="teams" pathRegex={/^teams/}/>
					<PathLink label="Stationer" href="stations" pathRegex={/^stations/}/>
					<PathLink label="Accounts" href="accounts" pathRegex={/^accounts/}/>
				</nav>
			</aside>

			<div className={"flex-1 flex flex-col"}>
				<header className={"h-26 px-4 py-2 shrink-0 grid grid-cols-3 items-center border-b border-black/20"}>
					<h3 className={"font-bold text-2xl uppercase"}>{pageTitle}</h3>

					<div className={"text-center"}>
						<p className={"font-medium uppercase"} suppressHydrationWarning>{dateStr}</p>
						<p className={"font-semibold text-xl"} suppressHydrationWarning>{timeStr}</p>
					</div>
				</header>

				<main className={"flex-1 overflow-y-scroll"}>
					{children}
				</main>
			</div>
		</div>
	)
}

interface PathLinkProps {
	label: string;
	href: string;
	pathRegex: RegExp;
}

function PathLink({label, href, pathRegex}: PathLinkProps) {
	const pathname = usePathname();
	const trimmedPath = pathname.replace(/^\/admin\/[0-9]+/, "")
	const isActive = trimmedPath.match(pathRegex);

	return (
		<Link href={href} className={cn(
			"text-white hover:text-slate-800 hover:bg-hover p-2  rounded-lg transition-colors uppercase block my-1",
			isActive ? "font-bold" : ""
		)}>
			{label}
		</Link>
	)
}