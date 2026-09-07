export const ADMIN_TRANSLATION_LOCALES = ['uk', 'en'] as const;
export const ADMIN_DEFAULT_TRANSLATION_LOCALE = 'uk' as const;

export type AdminTranslationLocale = (typeof ADMIN_TRANSLATION_LOCALES)[number];
export type LocalizedResourceId = 'Product' | 'ProductCategory' | 'Banner' | 'Page';

export type LocalizedFieldDefinition = {
	key: string;
	label: string;
	baseField: string;
	input: 'text' | 'textarea';
	requiredInDefaultLocale?: boolean;
};

export type LocalizedResourceDefinition = {
	resourceId: LocalizedResourceId;
	editorProperty: string;
	completenessProperty: string;
	primaryFieldKey: string;
	editorTitle: string;
	fields: readonly LocalizedFieldDefinition[];
};

export const buildTranslationInputPath = (
	locale: AdminTranslationLocale,
	fieldKey: string
) => `i18n_${locale}_${fieldKey}`;
