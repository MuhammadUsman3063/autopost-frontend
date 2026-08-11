// middleware.ts
export { default } from "next-auth/middleware";

// ISOLATED FUNCTION: Protect specific routes
export const config = {
  matcher: [
    // Yeh routes bina login ke access nahi honge
    "/dashboard/:path*",
    "/settings/:path*"
  ]
};