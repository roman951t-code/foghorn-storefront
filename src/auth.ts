import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
	session: {
		strategy: 'database',
	},
	callbacks: {
		authorized: async ({ auth }) => {
			// Logged in users are authenticated, otherwise redirect to login page
			return !!auth;
		},
	},
	adapter: PrismaAdapter(prisma),
	providers: [
		Google,

		CredentialsProvider({
			id: 'email-credentials',
			name: 'Email Login',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				const { email, password } = credentials ?? {};
				const user = await prisma.user.findUnique({ where: { email } });

				if (!user) return null;

				// Check email verification
				if (!user.emailVerified) {
					throw new Error('Please verify your email before logging in.');
				}

				// Check password (add bcrypt check if hashed)
				if (user.password !== password) {
					return null;
				}

				return {
					id: user.id,
					name: user.name,
					email: user.email,
				};
			},
		}),

		CredentialsProvider({
			id: 'phone-credentials',
			name: 'Phone Login',
			credentials: {
				phone: { label: 'Phone', type: 'text' },
			},
			async authorize(credentials) {
				const { phone } = credentials ?? {};
				if (phone === '+380992304351') {
					return {
						id: '2',
						name: 'Demo Phone User',
						phone,
					};
				}
				return null;
			},
		}),
	],
});
