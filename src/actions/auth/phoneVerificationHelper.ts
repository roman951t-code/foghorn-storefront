'use server';

import 'server-only';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type VerifyOptions = {
	phoneNumber: string;
	updatePhoneNumber?: boolean;
	disableSession?: boolean;
};

/**
 * Creates an OTP via the Better Auth phone plugin and immediately verifies it,
 * effectively skipping the manual code entry step.
 */
export async function autoVerifyPhoneNumber({
	phoneNumber,
	updatePhoneNumber = false,
	disableSession = false,
}: VerifyOptions) {
	// Clear any stale OTPs for this phone.
	await prisma.verification.deleteMany({ where: { identifier: phoneNumber } });

	// Let Better Auth generate and persist the OTP for us.
	await auth.api.sendPhoneNumberOTP({
		body: { phoneNumber },
	});

	const verification = await prisma.verification.findFirst({
		where: { identifier: phoneNumber },
		orderBy: { createdAt: 'desc' },
	});

	const [code] = verification?.value?.split(':') ?? [];
	if (!code) {
		throw new Error('OTP not found');
	}

	return auth.api.verifyPhoneNumber({
		body: { phoneNumber, code, updatePhoneNumber, disableSession },
		headers: await headers(),
	});
}
