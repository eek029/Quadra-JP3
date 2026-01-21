import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/forgot-password'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Auth routes
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');

    // Get user session
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If no user and trying to access protected route, redirect to login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // If user is logged in and tries to access auth pages, redirect based on profile status
    if (user && isAuthRoute) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('status')
            .eq('user_id', user.id)
            .single();

        const url = request.nextUrl.clone();

        if (!profile) {
            url.pathname = '/perfil';
            return NextResponse.redirect(url);
        }

        if (profile.status === 'pending_approval') {
            url.pathname = '/pendente';
            return NextResponse.redirect(url);
        }

        if (profile.status === 'approved') {
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }

        // If rejected, allow access to login to see the error message
    }

    // If user is logged in, check profile status for route protection
    if (user && !isPublicRoute) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('status, role')
            .eq('user_id', user.id)
            .single();

        if (!profile) {
            // No profile yet, redirect to complete it
            if (pathname !== '/perfil') {
                const url = request.nextUrl.clone();
                url.pathname = '/perfil';
                return NextResponse.redirect(url);
            }
            return NextResponse.next();
        }

        // Handle pending approval
        if (profile.status === 'pending_approval') {
            // Only allow /perfil and /pendente for pending users
            const allowedPendingRoutes = ['/perfil', '/pendente'];
            const isAllowedPending = allowedPendingRoutes.some(route => pathname.startsWith(route));

            if (!isAllowedPending) {
                const url = request.nextUrl.clone();
                url.pathname = '/pendente';
                return NextResponse.redirect(url);
            }
        }

        // Handle rejected
        if (profile.status === 'rejected') {
            // Rejected users can only access perfil to see their status
            if (pathname !== '/perfil') {
                const url = request.nextUrl.clone();
                url.pathname = '/perfil';
                return NextResponse.redirect(url);
            }
        }

        // Handle approved users - they have full access
        // No additional checks needed for approved users
    }

    return NextResponse.next();
}

export const config = {
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
