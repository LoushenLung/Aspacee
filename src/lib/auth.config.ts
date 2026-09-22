import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.email = (user as any).email || user.email;
        token.role = (user as any).role;
        token.memberId = (user as any).memberId;
        token.spaceOwnerId = (user as any).spaceOwnerId;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string) || session.user.email || '';
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).memberId = token.memberId;
        (session.user as any).spaceOwnerId = token.spaceOwnerId;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'ur-space-secret-key-32-characters-min-dev-secret',
  providers: [],
} satisfies NextAuthConfig;
