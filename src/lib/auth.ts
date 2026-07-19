import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { Adapter } from "next-auth/adapters";
import { db } from "../db"; 
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

// DEKLARASI TIPE TYPESCRIPT AGAR BEBAS ANY
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
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const userDb = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
        if (userDb.length === 0 || !userDb[0].password) return null; 

        const isPasswordValid = await compare(credentials.password, userDb[0].password);
        if (!isPasswordValid) return null;

        return {
          id: userDb[0].id,
          email: userDb[0].email,
          name: userDb[0].name,
          role: userDb[0].role,
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  
  // INI MESIN PENYUNTIK DATA KE DALAM SESSIONNYA
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Tarik role dari DB saat pertama kali login jika dari Google (karena google ga ngasih role)
        const dbUser = await db.select().from(users).where(eq(users.email, token.email as string)).limit(1);
        token.role = dbUser.length > 0 ? dbUser[0].role : "participant";
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