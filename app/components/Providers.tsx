// components/Providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

// ISOLATED FUNCTION: NextAuth Session Provider Wrapper
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}