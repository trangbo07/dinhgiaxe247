import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createSupabaseAuthClient } from "@/utils/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
        const email = credentials?.email?.trim();
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Vui lòng nhập email và mật khẩu");
        }

        const supabase = createSupabaseAuthClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          const msg = error?.message?.toLowerCase() ?? "";
          if (msg.includes("email not confirmed")) {
            throw new Error("Vui lòng xác nhận email trước khi đăng nhập");
          }
          throw new Error("Tài khoản hoặc mật khẩu không chính xác");
        }

        const meta = data.user.user_metadata ?? {};
        const name =
          (typeof meta.company_name === "string" && meta.company_name.trim()) ||
          (typeof meta.full_name === "string" && meta.full_name.trim()) ||
          (typeof meta.contact_name === "string" && meta.contact_name.trim()) ||
          (typeof meta.name === "string" && meta.name.trim()) ||
          email.split("@")[0];

        const role = (data.user.app_metadata?.role as string) ?? null;

        return {
          id: data.user.id,
          name,
          email: data.user.email ?? email,
          role,
        };
        } catch (err) {
          if (err instanceof Error) throw err;
          throw new Error("Không thể đăng nhập. Kiểm tra cấu hình Supabase trong .env");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.role = (token.role as string) ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "dev_nextauth_secret_change_me_2026",
  pages: {
    signIn: "/signin",
  },
};
