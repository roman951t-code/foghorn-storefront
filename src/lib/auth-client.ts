import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	baseURL: process.env.BASE_URL as string,
	plugins: [emailOTPClient()],
});

export const { signIn, signUp, useSession } = authClient;
