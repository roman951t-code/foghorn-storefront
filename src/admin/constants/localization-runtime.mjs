export const ADMIN_TRANSLATION_LOCALES = ['uk', 'en'];
export const ADMIN_DEFAULT_TRANSLATION_LOCALE = 'uk';

const PRODUCT_LOCALIZED_FIELDS = [
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
];

const PRODUCT_CATEGORY_LOCALIZED_FIELDS = [
	{
		key: 'name',
		label: 'Name',
		baseField: 'name',
		input: 'text',
		requiredInDefaultLocale: true,
	},
];

const PAGE_LOCALIZED_FIELDS = [
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
];

const BANNER_LOCALIZED_FIELDS = [
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
];

export const LOCALIZED_RESOURCE_DEFINITIONS = {
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

export const buildTranslationInputPath = (locale, fieldKey) => `i18n_${locale}_${fieldKey}`;
