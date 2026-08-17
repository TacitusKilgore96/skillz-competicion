import type { Metadata } from "next";
import {AdminShell} from "@/app/admin/AdminShell";

export const metadata: Metadata = {
	title: "Admin · Skills Competition",
	description: "Manage schools, classes, teams and events.",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
	return (
		<div className="min-h-screen text-slate-600">
			<AdminShell>{children}</AdminShell>
		</div>
	);
}
