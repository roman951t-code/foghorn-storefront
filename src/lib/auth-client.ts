import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
	baseURL: process.env.BASE_URL as string,
});

export const { signIn, signUp, useSession } = createAuthClient();
