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

	// Ensure we always include requested namespaces, even if some are missing,
	// to avoid runtime "missing namespace" errors in client components.
	const picked = pick(allMessages, namespaces);
	return namespaces.reduce<Record<string, unknown>>((acc, ns) => {
		acc[ns] = picked?.[ns] ?? {};
		return acc;
	}, {});
}

export async function getLocalizedMetadata(locale: string, pageKey: string): Promise<Metadata> {
	const t = await getTranslations({ locale, namespace: 'pages' });

	const title = t(`metadata.${pageKey}.title`);
	const description = t(`metadata.${pageKey}.description`);

	return {
		title,
		description,
	};
}
