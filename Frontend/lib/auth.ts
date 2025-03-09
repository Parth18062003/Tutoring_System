/* import NextAuth from "next-auth";
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
*/
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { openAPI } from "better-auth/plugins";
 
const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    plugins: [openAPI()],
    emailAndPassword: {
      enabled: true,
      //requireEmailVerification: true,
    },
/*     emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, token }) => {
        const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.BETTER_AUTH_URL}/dashboard/profile`;
        await fetch(`${process.env.BETTER_AUTH_URL}/api/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title : "Verify your email",
            magicLink: {verificationUrl},
          }),
        });
      },
    }, */
    socialProviders: { 
      google: { 
       clientId: process.env.GOOGLE_CLIENT_ID as string, 
       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
      } 
   },
});