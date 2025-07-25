import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { admin, captcha, openAPI } from "better-auth/plugins";
import { sendResetPasswordEmail } from "@/components/email/reset-password-link";
import { resend } from "./resend";
import { sendVerifyEmail } from "@/components/email/verify-email-token";
import { twoFactor } from "better-auth/plugins";
import { sendOtpMail } from "@/components/email/otp-mail";
import { sendUpdateEmail } from "@/components/email/update-email";
import { sendDeleteUser } from "@/components/email/delete-account-mail";

const prisma = new PrismaClient();
export const auth = betterAuth({
  appName: "Brain Wave",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: ["http://localhost:3000", "http://192.168.29.159:3000"],
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (
        { user, newEmail, url, token },
        request
      ) => {
        await resend.emails.send({
          from: "Brain Wave <onboarding@resend.dev>",
          to: ["2021.parth.kadam@ves.ac.in"],
          subject: "Approve your email change",
          react: sendUpdateEmail({
            title: "Update Email",
            magicLink: url,
          }),
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }, request) => {
        await resend.emails.send({
          from: "Brain Wave <onboarding@resend.dev>",
          to: ["2021.parth.kadam@ves.ac.in"],
          subject: "Confirm account deletion",
          react: sendDeleteUser({
            title: "Delete Account",
            magicLink: url,
          }),
        });
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24 * 7, // 7 days (every 7 days the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  plugins: [
    openAPI(),
    admin(),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
      endpoints: ["/authentication/sign-in", "/authentication/forgot-password", "/authentication/reset-password", "/authentication/two-factor","/authentication/sign-up"],
    }),
    twoFactor({
      skipVerificationOnEnable: true,
      otpOptions: {
        async sendOTP({ user, otp }, request) {
          await resend.emails.send({
            from: "Brain Wave <onboarding@resend.dev>",
            to: ["2021.parth.kadam@ves.ac.in"],
            subject: "OTP for two-factor authentication",
            react: sendOtpMail({
              title: "One Time Password",
              code: otp,
            }),
          });
        },
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    //requireEmailVerification: true,
    async sendResetPassword({ user, url }) {
      await resend.emails.send({
        from: "Brain Wave <onboarding@resend.dev>",
        to: ["2021.parth.kadam@ves.ac.in"],
        subject: "Reset your password",
        react: sendResetPasswordEmail({
          title: "Reset your password",
          magicLink: url,
        }),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, token }) {
      const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.BETTER_AUTH_URL}/dashboard/profile`;
      await resend.emails.send({
        from: "Brain Wave <onboarding@resend.dev>",
        to: ["2021.parth.kadam@ves.ac.in"],
        subject: "Verify your email",
        react: sendVerifyEmail({
          title: "Verify your email",
          magicLink: verificationUrl,
        }),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
    reddit: {
      clientId: process.env.REDDIT_CLIENT_ID as string,
      clientSecret: process.env.REDDIT_CLIENT_SECRET as string,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
