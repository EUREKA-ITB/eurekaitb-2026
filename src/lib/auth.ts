import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { Adapter } from "next-auth/adapters";
import { db } from "../db"; 
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  // 1. WAJIB: Kunci rahasia untuk enkripsi JWT di App Router Next.js
  secret: process.env.NEXTAUTH_SECRET,
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true, // Mencegah crash jika email sudah terdaftar
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const userDb = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
          if (userDb.length === 0 || !userDb[0].password) return null; 

          const isPasswordValid = await compare(credentials.password, userDb[0].password);
          if (!isPasswordValid) return null;

          return {
            id: userDb[0].id,
            email: userDb[0].email,
            name: userDb[0].name,
            role: userDb[0].role ?? "participant",
          };
        } catch (error) {
          console.error("Error in Credentials authorize:", error);
          return null;
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "participant";
      }

      // Ambil role dari DB secara aman dengan try-catch
      if (token.email) {
        try {
          const dbUser = await db.select().from(users).where(eq(users.email, token.email)).limit(1);
          if (dbUser.length > 0) {
            token.id = dbUser[0].id;
            token.role = dbUser[0].role ?? "participant";
          }
        } catch (error) {
          console.error("Error fetching user role in jwt callback:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  }
};