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

export const PRODUCT_LOCALIZED_FIELDS: readonly LocalizedFieldDefinition[] = [
	{
		key: 'name',
		label: 'Name',
		baseField: 'name',
		input: 'text',
		requiredInDefaultLocale: true,
	},
	{
		key: 'description',
		label: 'Description',
		baseField: 'description',
		input: 'textarea',
	},
	{
		key: 'guarantee',
		label: 'Guarantee Terms',
		baseField: 'guarantee',
		input: 'textarea',
	},
	{
		key: 'metaTitle',
		label: 'Meta Title',
		baseField: 'metaTitle',
		input: 'text',
	},
	{
		key: 'metaDescription',
		label: 'Meta Description',
		baseField: 'metaDescription',
		input: 'textarea',
	},
] as const;

export const PRODUCT_CATEGORY_LOCALIZED_FIELDS: readonly LocalizedFieldDefinition[] = [
	{
		key: 'name',
		label: 'Name',
		baseField: 'name',
		input: 'text',
		requiredInDefaultLocale: true,
	},
] as const;

export const PAGE_LOCALIZED_FIELDS: readonly LocalizedFieldDefinition[] = [
	{
		key: 'title',
		label: 'Title',
		baseField: 'title',
		input: 'text',
		requiredInDefaultLocale: true,
	},
	{
		key: 'excerpt',
		label: 'Excerpt',
		baseField: 'excerpt',
		input: 'textarea',
	},
	{
		key: 'content',
		label: 'Content',
		baseField: 'content',
		input: 'textarea',
	},
	{
		key: 'metaTitle',
		label: 'Meta Title',
		baseField: 'metaTitle',
		input: 'text',
	},
	{
		key: 'metaDescription',
		label: 'Meta Description',
		baseField: 'metaDescription',
		input: 'textarea',
	},
] as const;

export const BANNER_LOCALIZED_FIELDS: readonly LocalizedFieldDefinition[] = [
	{
		key: 'title',
		label: 'Title',
		baseField: 'title',
		input: 'text',
		requiredInDefaultLocale: true,
	},
	{
		key: 'subtitle',
		label: 'Subtitle',
		baseField: 'subtitle',
		input: 'textarea',
	},
	{
		key: 'linkLabel',
		label: 'Link Label',
		baseField: 'linkLabel',
		input: 'text',
	},
] as const;

export const LOCALIZED_RESOURCE_DEFINITIONS: Record<
	LocalizedResourceId,
	LocalizedResourceDefinition
> = {
	Product: {
		resourceId: 'Product',
		editorProperty: 'localizedContentEditor',
		completenessProperty: 'translationCompleteness',
		primaryFieldKey: 'name',
		editorTitle: 'Localized Content',
		fields: PRODUCT_LOCALIZED_FIELDS,
	},
	ProductCategory: {
		resourceId: 'ProductCategory',
		editorProperty: 'localizedContentEditor',
		completenessProperty: 'translationCompleteness',
		primaryFieldKey: 'name',
		editorTitle: 'Localized Category Name',
		fields: PRODUCT_CATEGORY_LOCALIZED_FIELDS,
	},
	Banner: {
		resourceId: 'Banner',
		editorProperty: 'localizedContentEditor',
		completenessProperty: 'translationCompleteness',
		primaryFieldKey: 'title',
		editorTitle: 'Localized Promo Content',
		fields: BANNER_LOCALIZED_FIELDS,
	},
	Page: {
		resourceId: 'Page',
		editorProperty: 'localizedContentEditor',
		completenessProperty: 'translationCompleteness',
		primaryFieldKey: 'title',
		editorTitle: 'Localized Page Content',
		fields: PAGE_LOCALIZED_FIELDS,
	},
};

export const buildTranslationInputPath = (
	locale: AdminTranslationLocale,
	fieldKey: string
) => `i18n_${locale}_${fieldKey}`;
