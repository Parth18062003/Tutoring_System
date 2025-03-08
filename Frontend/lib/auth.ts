import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { loginSchema } from "./schema";
import { compareSync } from "bcrypt-ts";
import authConfig from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const validatedCredentials = loginSchema.parse(credentials);

        // Find user by email (without checking password)
        const user = await prisma.user.findUnique({
          where: { email: validatedCredentials.email },
        });

        if (!user) {
          return null; // Return null for invalid credentials
        }

        // Compare provided password with stored hash
        const passwordValid = await compareSync(
          validatedCredentials.password,
          user?.password || ""
        );

        if (!passwordValid) {
          return null; // Return null for invalid password
        }

        console.log("User authenticated", user);
        return user; // Valid credentials
      },
    }),
  ],
  
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.id = user.id;
      }
      return token;
    },
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth
    },
  },
  pages: {
    signIn: "/authentication/sign-in",
  },
});
