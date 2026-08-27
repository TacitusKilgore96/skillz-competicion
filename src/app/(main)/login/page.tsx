import { Suspense } from "react";
import Login from "@/components/Login";
import { IconLoader2 } from "@tabler/icons-react";

export default function LoginPage() {
	return (
		<main className="min-h-screen bg-background text-primary flex items-center justify-center p-4 sm:p-6">
			<div className="w-full max-w-lg">
				<Suspense
					fallback={
						<div className="flex flex-col items-center justify-center text-secondary gap-2 p-8 bg-box-background rounded-2xl border border-border">
							<IconLoader2 size={24} className="animate-spin text-primary" />
							<p className="text-xs text-secondary font-medium">Indlæser login...</p>
						</div>
					}
				>
					<Login />
				</Suspense>
			</div>
		</main>
	);
}
