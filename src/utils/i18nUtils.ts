import { useTranslations } from 'next-intl';

// Deliberately client-safe — imported from constants/cart.ts which reaches
// the client bundle via UserActions.tsx. No 'use cache', no server-only
// imports here; the server-only helpers (loadClientMessages,
// getLocalizedMetadata) live in ./i18nServerUtils.ts.

export const extractI18nData = (
	t: ReturnType<typeof useTranslations>,
	keys: string[],
): { [key: string]: string } => Object.fromEntries(keys.map((key) => [key, t(key)]));
