import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const feedbackSchemaShape = (t: {
	nameRequired: string;
	lastNameRequired: string;
	feedbackRequired: string;
	inputMaxLength: string;
	feedbackMinLength: string;
	feedbackMaxLength: string;
}) =>
	z.object({
		name: z
			.string({ message: t.nameRequired })
			.min(2, { message: t.nameRequired })
			.max(60, { message: t.inputMaxLength })
			.nonempty(),
		lastName: z
			.string({ message: t.lastNameRequired })
			.min(2, { message: t.lastNameRequired })
			.max(60, { message: t.inputMaxLength })
			.nonempty(),
		feedback: z
			.string({ message: t.feedbackRequired })
			.min(5, { message: t.feedbackMinLength })
			.max(500, { message: t.feedbackMaxLength }),
		advantages: z.string().max(200, { message: t.feedbackMaxLength }).optional(),
		disAdvantages: z.string().max(200, { message: t.feedbackMaxLength }).optional(),
		rating: z.number().min(1).max(5),
	});

export const createFeedbackSchema = (t: I18nData) =>
	feedbackSchemaShape(t as Parameters<typeof feedbackSchemaShape>[0]);

export async function getFeedbackSchema() {
	const validationT = await getTranslations('validation');

	return feedbackSchemaShape({
		nameRequired: validationT('nameRequired'),
		lastNameRequired: validationT('lastNameRequired'),
		feedbackRequired: validationT('feedbackRequired'),
		inputMaxLength: validationT('inputMaxLength'),
		feedbackMinLength: validationT('feedbackMinLength'),
		feedbackMaxLength: validationT('feedbackMaxLength'),
	});
}

export type FeedbackSchema = z.infer<Awaited<ReturnType<typeof getFeedbackSchema>>>;
