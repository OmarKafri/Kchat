import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Loging } from "@/lib/actions/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing email or password");
          }

          const response = await Loging({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (!response.success || !response.data) {
            throw new Error(response.error || "Invalid credentials");
          }

          const user = response.data;

          return {
            id: String(user.id),
            email: user.email,
            name: user.username,
            image: user.image || null,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge:60 *60 *24
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          image: token.image as string,
          emailVerified: null,
        };
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});
