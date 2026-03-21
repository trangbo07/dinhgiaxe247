import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === "admin" && credentials?.password === "123") {
          return { id: "1", name: "TrangNK18", email: "trangnk18@fpt.com" };
        }
        throw new Error("Tài khoản hoặc mật khẩu không chính xác");
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "dev_nextauth_secret_change_me_2026",
  pages: {
    signIn: "/signin",
  }
});

export { handler as GET, handler as POST };
