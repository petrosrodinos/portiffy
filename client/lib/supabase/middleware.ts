import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        },
    );

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (request.nextUrl.pathname.startsWith("/api/webhooks")) {
        return supabaseResponse;
    }

    if (
        user?.app_metadata?.role !== "super-admin" &&
        request.nextUrl.pathname.startsWith("/console/admin")
    ) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    if (
        !user && (
            request.nextUrl.pathname.startsWith("/console") ||
            request.nextUrl.pathname == "/auth/create-user" ||
            request.nextUrl.pathname == "/auth/select-plan" ||
            request.nextUrl.pathname == "/auth/portfolio-resume"
        )
    ) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    if (
        user &&
        (request.nextUrl.pathname == "/auth/sign-in" ||
            request.nextUrl.pathname == "/auth/sign-up")
    ) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse;
}
