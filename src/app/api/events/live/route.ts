import { NextRequest } from "next/server";
import { liveEventBus } from "@/libs/eventBus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const responseStream = new TransformStream();
	const writer = responseStream.writable.getWriter();
	const encoder = new TextEncoder();

	// Initial ping
	writer.write(encoder.encode(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`));

	const onUpdate = (eventData: { type: string; payload: unknown; timestamp: number }) => {
		try {
			writer.write(
				encoder.encode(`event: message\ndata: ${JSON.stringify(eventData)}\n\n`)
			);
		} catch {
			// Writer closed or aborted
		}
	};

	liveEventBus.on("broadcast", onUpdate);

	// Heartbeat interval to keep connection alive
	const interval = setInterval(() => {
		try {
			writer.write(encoder.encode(`: ping\n\n`));
		} catch {
			clearInterval(interval);
		}
	}, 15000);

	request.signal.addEventListener("abort", () => {
		clearInterval(interval);
		liveEventBus.off("broadcast", onUpdate);
		writer.close().catch(() => {});
	});

	return new Response(responseStream.readable, {
		headers: {
			"Content-Type": "text/event-stream; charset=utf-8",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
		},
	});
}
