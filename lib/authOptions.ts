// lib/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      // ISOLATED FUNCTION: Backend API se login verify karna
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email aur password zaroori hai");
        }

       const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const res = await fetch(`${backendUrl}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: credentials?.email, password: credentials?.password }),
});
        const data = await res.json();

        // Agar ghalat password ya email ho
        if (!res.ok) {
          throw new Error(data.message || "Ghalat email ya password");
        }

        // Backend se jo user data aaya, wo NextAuth session mein return ho jayega
        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email
        };
      }
    })
          

  ],

  callbacks: {
    // 1. Backend se aayi hui ID ko pehle JWT token mein save karo
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; 
      }
      return token;
    },
    // 2. Phir us token se ID nikal kar frontend ke Session mein daal do
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id; 
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};