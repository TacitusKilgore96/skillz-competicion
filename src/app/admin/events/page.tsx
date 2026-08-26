import {AdminShell} from "@/app/admin/shell";

export default function Page() {
    return (
        <AdminShell pageTitle={"Begivenheder"} currentPath={"/admin/events"}>
            <div className={"p-8 h-full"}>
                <div className={"mx-auto max-w-300 border-2 border-slate-300 rounded-lg p-4 h-full overflow-y-scroll"}>

                </div>
            </div>
        </AdminShell>
    )
}