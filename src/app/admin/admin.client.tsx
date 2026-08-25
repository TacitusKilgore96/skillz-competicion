"use client"

export function AdminSidebar() {
    return (
        <div className="w-64 bg-background-secondary">
            <div className={"flex flex-col h-20 border-b border-black/40"}>

            </div>

            <div className={"flex flex-col"}>
                <PathLink path={"/"} label={"Overview"}/>
                <PathLink path={"/teams"} label={"Teams"}/>
                <PathLink path={"/events"} label={"Events"}/>
            </div>
        </div>
    )
}

function PathLink({path, label}: {path: string, label: string}) {
    return (
        <a href={`/admin${path}`} className={"text-center px-4 py-2 mx-2 mt-2 hover:bg-hover/40 rounded-xl transition-colors font-semibold"}>{label}</a>
    )
}