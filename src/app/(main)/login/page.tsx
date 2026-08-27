import { Suspense } from "react";
import Login from "@/components/Login";
import { IconLoader2 } from "@tabler/icons-react";

export default function LoginPage() {
	return (
		<main className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
			{/* Subtle decorative glow */}
			<div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

			<div className="relative z-10 w-full max-w-md">
				<Suspense
					fallback={
						<div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-8 bg-white rounded-lg border border-slate-200">
							<IconLoader2 size={24} className="animate-spin text-slate-700" />
							<p className="text-xs text-slate-500 font-medium">Indlæser login...</p>
						</div>
					}
				>
					<Login />
				</Suspense>
			</div>
		</main>
	);
}
