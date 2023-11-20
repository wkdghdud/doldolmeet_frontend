import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { backend_api } from "@/utils/api";

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
        try {
          const response = await backend_api.post(
            "/login",
            {
              username: credentials?.username,
              password: credentials?.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          const user = response.data;

          if (user && response.status === 200) {
            user.data = response.headers.authorization;
            return user;
          }
          // TODO: 로그인 실패 처리 필요
          throw new Error("로그인에 실패했습니다.");
        } catch (error) {
          console.error("Error during login:", error);
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
  session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };
