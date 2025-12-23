import { createAuthClient } from 'better-auth/react';
import { emailOTPClient, phoneNumberClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	plugins: [phoneNumberClient(), emailOTPClient()],
});

export const { signIn, signUp, useSession } = authClient;
