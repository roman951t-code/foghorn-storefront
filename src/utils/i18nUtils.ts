import { useTranslations } from 'next-intl';
import { getMessages } from 'next-intl/server';
import pick from 'lodash.pick';

export const extractI18nData = (
	t: ReturnType<typeof useTranslations>,
	keys: string[]
): { [key: string]: string } => Object.fromEntries(keys.map((key) => [key, t(key)]));

export async function loadClientMessages(namespaces: string[]) {
	const allMessages = await getMessages();
	return pick(allMessages, namespaces);
}
