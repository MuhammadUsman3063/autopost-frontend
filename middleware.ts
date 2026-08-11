// middleware.ts
import { withAuth } from "next-auth/middleware";

// ISOLATED FUNCTION: Explicit function export for Vercel Build
export default withAuth;

// Protect specific routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*"
  ]
};