import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/ar/auth/login",
    error: "/ar/auth/login",
    newUser: "/ar/auth/register",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { vendorProfile: true },
        });

        if (!user || !user.isActive) {
          throw new Error("بيانات الدخول غير صحيحة أو الحساب معطل");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("بيانات الدخول غير صحيحة");
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
          vendorId: user.vendorProfile?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.vendorId = (user as any).vendorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role as Role;
        (session.user as any).vendorId = token.vendorId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper to get current session on server
export async function getCurrentUser() {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  return session?.user as
    | {
        id: string;
        email: string;
        name: string;
        role: Role;
        vendorId?: string | null;
        image?: string | null;
      }
    | undefined;
}

export function hasRole(userRole: Role, allowed: Role | Role[]): boolean {
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  return roles.includes(userRole);
}

export function isAdmin(role: Role) {
  return role === "ADMIN" || role === "STAFF";
}

export function isVendor(role: Role) {
  return role === "VENDOR" || role === "ADMIN";
}
