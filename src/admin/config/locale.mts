import { locales as AdminJSLocales, type LocaleTranslations } from 'adminjs';
import type { ResourceKey } from 'i18next';
import { enAdminLocale } from '../locales/en.mts';
import { uaAdminLocale } from '../locales/ua.mts';

type LocaleObject = Record<string, ResourceKey | undefined>;

const isPlainObject = (value: ResourceKey | undefined): value is LocaleObject =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const mergeDeep = <T extends LocaleObject>(base: T, override: LocaleObject): T => {
	const result: LocaleObject = { ...base };
	for (const [key, value] of Object.entries(override)) {
		const existing = result[key];
		if (isPlainObject(existing) && isPlainObject(value)) {
			result[key] = mergeDeep(existing, value);
		} else {
			result[key] = value;
		}
	}
	return result as T;
};

export const translations: Record<string, LocaleTranslations> = {
	en: mergeDeep(AdminJSLocales.en ?? {}, enAdminLocale as LocaleObject),
	ua: mergeDeep(AdminJSLocales.ua ?? {}, uaAdminLocale as LocaleObject),
};
