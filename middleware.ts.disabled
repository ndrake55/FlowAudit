import { withAuth } from "next-auth/middleware";

// Force rebuild 2026-02-09

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/settings/:path*", "/audit/:path*"],
};
