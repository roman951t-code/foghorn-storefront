import { createAuthClient } from 'better-auth/react';
import { nextCookies } from 'better-auth/next-js';

export const authClient = createAuthClient({
	baseURL: process.env.BASE_URL as string,
	plugins: [nextCookies()],
});

export const { signIn, signUp, useSession } = authClient;
