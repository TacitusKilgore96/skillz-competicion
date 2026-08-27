import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { AuthUser } from "@/libs/auth";

export function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const authCookie = request.cookies.get("skills_auth");

	let user: AuthUser | null = null;
	if (authCookie && authCookie.value) {
		try {
			user = JSON.parse(authCookie.value);
		} catch {
			user = null;
		}
	}

	const isProtectedAdmin = pathname.startsWith("/admin");
	const isProtectedStation = pathname.startsWith("/station");
	const isProtectedTeam = pathname.startsWith("/team");
	const isProtectedTeacher = pathname.startsWith("/teacher");
	const isLoginPage = pathname === "/login";

	const fullPath = `${pathname}${search}`;
	const loginUrl = new URL("/login", request.url);
	loginUrl.searchParams.set("redirect", fullPath);

	// 1. If visiting login page while already authenticated
	if (isLoginPage && user) {
		const redirectParam = request.nextUrl.searchParams.get("redirect");
		if (redirectParam && redirectParam.startsWith("/")) {
			return NextResponse.redirect(new URL(redirectParam, request.url));
		}
		if (user.type === "ORGANIZER") {
			return NextResponse.redirect(new URL("/admin", request.url));
		} else if (user.type === "POST_GUARD") {
			return NextResponse.redirect(new URL("/station", request.url));
		} else if (user.type === "TEAM") {
			return NextResponse.redirect(new URL("/team", request.url));
		}
	}

	// 2. Admin routes protection
	if (isProtectedAdmin) {
		if (!user) {
			return NextResponse.redirect(loginUrl);
		}
		if (user.type !== "ORGANIZER") {
			return NextResponse.redirect(loginUrl);
		}
	}

	// 3. Station routes protection
	if (isProtectedStation) {
		if (!user) {
			return NextResponse.redirect(loginUrl);
		}
		if (user.type !== "POST_GUARD" && user.type !== "ORGANIZER") {
			return NextResponse.redirect(loginUrl);
		}
	}

	// 4. Team routes protection
	if (isProtectedTeam) {
		if (!user) {
			return NextResponse.redirect(loginUrl);
		}
		if (user.type !== "TEAM" && user.type !== "ORGANIZER") {
			return NextResponse.redirect(loginUrl);
		}
	}

	// 5. Teacher routes protection
	if (isProtectedTeacher) {
		if (!user) {
			return NextResponse.redirect(loginUrl);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/admin/:path*",
		"/station/:path*",
		"/team/:path*",
		"/teacher/:path*",
		"/login",
	],
};
