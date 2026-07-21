import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from "better-auth/cookies"

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    return NextResponse.next()
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

// Intercept all routes starting with /dashboard
export const config = {
    matcher: ["/dashboard/:path*"],
};