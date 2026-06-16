import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

// Credentials auth tuned for self-hosting: sign in with email + password.
// On the first sign-in for an email, the account is created automatically.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // Register on first sign-in.
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
              passwordHash: hashPassword(password),
            },
          });
        } else if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
          return null;
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
