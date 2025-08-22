import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const feedbackSchemaShape = (t: {
	nameRequired: string;
	lastNameRequired: string;
	feedbackRequired: string;
	inputMaxLength: string;
	ratingRequired: string;
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
			.min(5, { message: t.feedbackRequired })
			.max(500, { message: t.inputMaxLength }),
		advantages: z.string().max(200, { message: t.inputMaxLength }).optional(),
		disAdvantages: z.string().max(200, { message: t.inputMaxLength }).optional(),
		rating: z
			.number({ required_error: t.ratingRequired })
			.min(1, { message: t.ratingRequired })
			.max(5, { message: t.ratingRequired }),
	});

export const createFeedbackSchema = (t: I18nData) =>
	feedbackSchemaShape(t as Parameters<typeof feedbackSchemaShape>[0]);

export async function getFeedbackSchema() {
	const t = await getTranslations('Validation');

	return feedbackSchemaShape({
		nameRequired: t('nameRequired'),
		lastNameRequired: t('lastNameRequired'),
		feedbackRequired: t('feedbackRequired'),
		inputMaxLength: t('inputMaxLength'),
		ratingRequired: t('ratingRequired'),
	});
}

export type FeedbackSchema = z.infer<Awaited<ReturnType<typeof getFeedbackSchema>>>;
