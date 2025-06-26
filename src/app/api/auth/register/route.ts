// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getEmailSchema } from '@/schemas/emailSignUpSchema';
import { signIn } from '@/lib/auth';

export async function POST(req: Request) {
	const t = (key: string) => key;

	const formData = await req.formData();
	const formDataEntries = Object.fromEntries(formData.entries());

	const authSchema = await getEmailSchema();
	const validatedFormData = authSchema.safeParse(formDataEntries);
	if (!validatedFormData.success) {
		return NextResponse.json({ message: t('invalidFormData') }, { status: 400 });
	}

	const { email, password } = validatedFormData.data;
	const hashedPassword = await bcrypt.hash(password, 10);

	const existingUser = await prisma.user.findUnique({ where: { email } });
	if (existingUser) {
		return NextResponse.json({ message: t('userExists') }, { status: 400 });
	}

	await prisma.user.create({
		data: {
			email,
			hashedPassword,
			emailVerified: null,
		},
	});

	await signIn('email-credentials', {
		email,
		password,
		// callbackUrl: '/ua',
	});

	// if (result?.error) {
	// 	return NextResponse.json({ message: t('useRegisterFail') }, { status: 401 });
	// }

	// Return success and rely on NextAuth to set the session cookie
	return NextResponse.json({ success: true });
}
