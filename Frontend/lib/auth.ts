import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { loginSchema } from "./schema";
import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import { v4 as uuid } from "uuid";
import { encode as defaultEncode } from "next-auth/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
        const user = await prisma.user.findUniqueOrThrow({
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
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await PrismaAdapter(prisma)?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
  pages: {
    signIn: "/authentication/sign-in",
  }
});
