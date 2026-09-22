import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '@/lib/validations';
import { authConfig } from '@/lib/auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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

        const identifier = parsed.data.username.trim();

        // Support login with either username or email
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: identifier },
              { email: identifier.toLowerCase() },
            ],
          },
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
          email: user.email ?? '',
          role: user.role,
          memberId: user.member?.id ?? null,
          spaceOwnerId: user.spaceOwner?.id ?? null,
          name: user.member?.namaMember ?? user.spaceOwner?.namaPemilik ?? user.username,
        };
      },
    }),
  ],
});
