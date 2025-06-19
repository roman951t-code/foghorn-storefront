import { sendVerificationEmail } from '@/lib/emailVerification';

const user = await prisma.user.create({
	data: {
		email,
		password: hashedPassword, // make sure you hash passwords!
	},
});

await sendVerificationEmail(email, user.id);
