// lib/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { NextAuthConfig } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';

export const authConfig = {
	adapter: PrismaAdapter(prisma) as Adapter,
	session: {
		strategy: 'database',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	pages: {
		signIn: '/',
		signOut: '/',
	},
	trustHost: true,
	debug: process.env.NODE_ENV !== 'production',

	providers: [
		Google,
		Credentials({
			id: 'email-credentials',
			name: 'Email Login',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				const { email, password } = credentials ?? {};

				const user = await prisma.user.findUnique({ where: { email } });
				if (!user || !user.hashedPassword) return null;

				const isValid = await bcrypt.compare(password, user.hashedPassword);
				return isValid ? user : null;
			},
		}),
		Credentials({
			id: 'phone-credentials',
			name: 'Phone Login',
			credentials: { phone: { label: 'Phone', type: 'text' } },
			async authorize(credentials) {
				const { phone } = credentials ?? {};
				if (phone === '+380992304351') {
					return {
						id: 'demo-user-id',
						name: 'Demo Phone User',
						phone,
						email: 'demo@phone.com',
					};
				}
				return null;
			},
		}),
	],

	callbacks: {
		// Store sessionToken in JWT to later retrieve session from DB
		async jwt({ token, user, account }) {
			if (account?.provider === 'email-credentials' || account?.provider === 'phone-credentials') {
				if (user?.id) {
					const sessionToken = uuidv4();
					const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

					const session = await PrismaAdapter(prisma).createSession!({
						userId: user.id!,
						sessionToken,
						expires,
					});
					token.sessionId = session.sessionToken;
				}
			}
			return token;
		},

		session({ session }) {
			if (!session.user) return session;
			const user = {
				id: session.user.id,
				name: session.user.name,
				email: session.user.email,
				emailVerified: session.user.emailVerified,
				image: session.user.image,
			};
			session.user = user;
			return session;
		},
	},
	jwt: {
		async encode({ token }) {
			return token?.sessionId as unknown as string;
		},
	},
	events: {
		async signOut(message) {
			if ('session' in message && message.session?.sessionToken) {
				await prisma.session.deleteMany({
					where: {
						sessionToken: message.session.sessionToken,
					},
				});
			}
		},
	},
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
