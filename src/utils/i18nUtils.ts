import { useTranslations } from 'next-intl';
import { type Metadata } from 'next';
import { getMessages, getTranslations } from 'next-intl/server';
import pick from 'lodash.pick';

export const extractI18nData = (
	t: ReturnType<typeof useTranslations>,
	keys: string[]
): { [key: string]: string } => Object.fromEntries(keys.map((key) => [key, t(key)]));

export async function loadClientMessages(namespaces: string[]) {
	const allMessages = await getMessages();
	return pick(allMessages, namespaces);
}

export async function getLocalizedMetadata(locale: string, pageKey: string): Promise<Metadata> {
	const t = await getTranslations({ locale, namespace: 'Metadata' });

	const title = t(`${pageKey}.title`);
	const description = t(`${pageKey}.description`);

	return {
		title,
		description,
	};
}
