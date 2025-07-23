import { createAuthClient } from 'better-auth/react';
import { phoneNumberClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	baseURL: process.env.BASE_URL as string,
	plugins: [phoneNumberClient()],
});

export const { signIn, signUp, useSession } = authClient;
