import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
	session: {
		strategy: 'database',
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

				if (email === 'user@example.com' && password === 'password') {
					return {
						id: '1',
						name: 'Demo Email User',
						email,
					};
				}
				return null;
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
