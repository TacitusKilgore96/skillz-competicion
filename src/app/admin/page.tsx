import {AdminShell} from "@/app/admin/shell";

export default function Page() {
    return (
        <AdminShell pageTitle={"Dashboard"} currentPath={"/admin"}>
            <div>
                <h1>Admin Page</h1>
            </div>
        </AdminShell>
    )
}