import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // For now, allow all routes (placeholder protection)
    // Future: Check Supabase session and redirect accordingly

    const { pathname } = request.nextUrl;

    // Allow public routes
    const publicRoutes = ['/login', '/signup'];
    const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // TODO: Add authentication check
    // const session = await getSession();

    // For now, just pass through
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
