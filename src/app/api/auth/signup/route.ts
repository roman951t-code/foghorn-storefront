import { Resend } from 'resend';
import { EmailTemplate } from '@/components/auth/EmailTemplate';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
	const body = await req.json();
	const { email, password } = body;

	try {
		const { data, error } = await resend.emails.send({
			from: 'Acme <onboarding@resend.dev>',
			to: [email],
			subject: 'Hello world',
			react: await EmailTemplate({ firstName: 'John' }),
		});

		if (error) {
			return Response.json({ error }, { status: 500 });
		}

		return Response.json(data);
	} catch (error) {
		return Response.json({ error }, { status: 500 });
	}
}
