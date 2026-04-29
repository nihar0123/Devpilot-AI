import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const hasGitHub = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);
const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasEmail = hasDatabase;

const providers: NextAuthOptions["providers"] = [];

if (hasGitHub) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (hasGoogle) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  );
}

if (hasEmail) {
  if (process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASS) {
    providers.push(
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
          port: Number(process.env.EMAIL_SERVER_PORT) || 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASS,
          },
        },
        from: process.env.EMAIL_FROM,
        async sendVerificationRequest({ identifier: email, url, provider }) {
          const { sendEmail } = await import('@/lib/email');
          const { magicLinkTemplate } = await import('@/lib/emailTemplates');
          
          await sendEmail({
            to: email,
            subject: 'Sign in to DevPilot AI',
            html: magicLinkTemplate({ url, email }),
          });
        },
      })
    );
  } else {
    // Dev mode fallback
    providers.push(
      EmailProvider({
        from: "onboarding@resend.dev",
        async sendVerificationRequest({ identifier, url }) {
          console.log("\n=======================================================");
          console.log(`🪄 MAGIC LINK FOR ${identifier}:`);
          console.log(url);
          console.log("=======================================================\n");
        }
      })
    );
  }
}

export const authConfig: NextAuthOptions = {
  ...(hasDatabase ? { adapter: PrismaAdapter(prisma) } : {}),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: hasDatabase ? "database" : "jwt" },
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url === "/" ? "/dashboard" : url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? (token.sub as string);
      }
      return session;
    },
  },
};

export const auth = () => getServerSession(authConfig);
