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
			.string({ required_error: t.nameRequired })
			.min(2, { message: t.nameRequired })
			.max(60, { message: t.inputMaxLength })
			.nonempty(),
		lastName: z
			.string({ required_error: t.lastNameRequired })
			.min(2, { message: t.lastNameRequired })
			.max(60, { message: t.inputMaxLength })
			.nonempty(),
		feedback: z
			.string({ required_error: t.feedbackRequired })
			.min(5, { message: t.feedbackMinLength })
			.max(500, { message: t.feedbackMaxLength }),
		advantages: z.string().max(200, { message: t.feedbackMaxLength }).optional(),
		disAdvantages: z.string().max(200, { message: t.feedbackMaxLength }).optional(),
		rating: z.number().min(1).max(5),
	});

export const createFeedbackSchema = (t: I18nData) =>
	feedbackSchemaShape(t as Parameters<typeof feedbackSchemaShape>[0]);

export async function getFeedbackSchema() {
	const t = await getTranslations('validation');

	return feedbackSchemaShape({
		nameRequired: t('nameRequired'),
		lastNameRequired: t('lastNameRequired'),
		feedbackRequired: t('feedbackRequired'),
		inputMaxLength: t('inputMaxLength'),
		feedbackMinLength: t('feedbackMinLength'),
		feedbackMaxLength: t('feedbackMaxLength'),
	});
}

export type FeedbackSchema = z.infer<Awaited<ReturnType<typeof getFeedbackSchema>>>;
