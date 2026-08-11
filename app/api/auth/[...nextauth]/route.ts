// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

// ISOLATED FUNCTION: NextAuth Engine initialize karna
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };