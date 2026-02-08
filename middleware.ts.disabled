import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/",
    "/about",
    "/pricing",
    "/features"
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        // console.log("Middleware running on:", req.url);
        // await auth.protect();
    }
});

export const config = {
    runtime: 'nodejs',
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|api|trpc|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
