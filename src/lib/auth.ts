import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '@/lib/validations';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { username: parsed.data.username },
          include: {
            member: true,
            spaceOwner: true,
          },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          username: user.username,
          role: user.role,
          memberId: user.member?.id ?? null,
          spaceOwnerId: user.spaceOwner?.id ?? null,
          name: user.member?.namaMember ?? user.spaceOwner?.namaPemilik ?? user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.memberId = (user as any).memberId;
        token.spaceOwnerId = (user as any).spaceOwnerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).memberId = token.memberId;
        (session.user as any).spaceOwnerId = token.spaceOwnerId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'ur-space-secret-key-32-characters-min-dev-secret',
});
