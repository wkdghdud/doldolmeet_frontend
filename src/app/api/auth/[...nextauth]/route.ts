import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { CookiesOptions } from "next-auth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "Credentials",
      name: "Credentials",
      credentials: {
        username: {
          label: "이메일",
          type: "text",
          placeholder: "이메일 주소 입력 요망",
        },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials, req) {
        const res = await fetch("http://localhost:8080/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          }),
        });
        const user = await res.json();
        // localStorage.setItem("token", res.headers.get("Authorization") ?? "");
        if (user) {
          user.data = res.headers.get("Authorization");
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return res.headers.get("Authorization");

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // @ts-ignore
        token.access_token = user.access_token;
      }
      return { ...token, ...user };
    },

    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };