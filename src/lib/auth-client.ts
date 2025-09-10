import { createAuthClient } from 'better-auth/react';
import { emailOTPClient, phoneNumberClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	baseURL: process.env.BASE_URL as string,
	plugins: [phoneNumberClient(), emailOTPClient()],
});

export const { signIn, signUp, useSession } = authClient;
