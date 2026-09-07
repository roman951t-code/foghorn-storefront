import { localizeUnit } from './unitLocalization';

type LocalizedToken = {
	en: string;
	uk: string;
	aliases: string[];
};

const normalizeToken = (value: string) =>
	value
		.toLowerCase()
		.replace(/[ʼ’`´]/g, "'")
		.replace(/\s+/g, ' ')
		.trim();

const resolveTargetLocale = (locale?: string | null): 'en' | 'uk' | null => {
	if (!locale) return null;
	const normalized = locale.trim().toLowerCase();
	if (!normalized) return null;
	if (normalized === 'en' || normalized.startsWith('en-')) return 'en';
	if (normalized === 'uk' || normalized.startsWith('uk-') || normalized === 'ua') return 'uk';
	return null;
};

const createLookup = (tokens: LocalizedToken[]) => {
	const lookup = new Map<string, LocalizedToken>();
	for (const token of tokens) {
		for (const alias of token.aliases) {
			lookup.set(normalizeToken(alias), token);
		}
		lookup.set(normalizeToken(token.en), token);
		lookup.set(normalizeToken(token.uk), token);
	}
	return lookup;
};

const ATTRIBUTE_NAME_TOKENS: LocalizedToken[] = [
	{ en: 'Model', uk: 'Модель', aliases: ['model', 'модель'] },
	{ en: 'Size', uk: 'Розмір', aliases: ['size', 'розмір'] },
	{ en: 'Material', uk: 'Матеріал', aliases: ['material', 'матеріал'] },
	{ en: 'Length', uk: 'Довжина', aliases: ['length', 'довжина'] },
	{ en: 'Width', uk: 'Ширина', aliases: ['width', 'ширина'] },
	{ en: 'Height', uk: 'Висота', aliases: ['height', 'висота'] },
	{ en: 'Color', uk: 'Колір', aliases: ['color', 'colour', 'колір', 'цвет'] },
	{ en: 'Memory', uk: "Пам'ять", aliases: ['memory', 'storage', "пам'ять", 'памʼять'] },
	{
		en: 'RAM',
		uk: "Оперативна пам'ять",
		aliases: ['ram', 'оперативна памʼять', "оперативна пам'ять", 'озп'],
	},
	{
		en: 'Diagonal',
		uk: 'Діагональ',
		aliases: ['diagonal', 'display size', 'screen size', 'діагональ'],
	},
	{ en: 'Resolution', uk: 'Роздільна здатність', aliases: ['resolution', 'роздільна здатність'] },
	{ en: 'Refresh rate', uk: 'Частота оновлення', aliases: ['refresh rate', 'частота оновлення'] },
	{ en: 'Processor', uk: 'Процесор', aliases: ['processor', 'cpu', 'процесор'] },
	{ en: 'Graphics', uk: 'Графіка', aliases: ['graphics', 'gpu', 'відеокарта', 'графіка'] },
	{ en: 'Battery', uk: 'Батарея', aliases: ['battery', 'акумулятор', 'батарея'] },
	{ en: 'Weight', uk: 'Вага', aliases: ['weight', 'вага'] },
];

const ATTRIBUTE_NAME_LOOKUP = createLookup(ATTRIBUTE_NAME_TOKENS);

const localizeToken = (
	value: string,
	locale: string | null | undefined,
	lookup: Map<string, LocalizedToken>
) => {
	const targetLocale = resolveTargetLocale(locale);
	if (!targetLocale) return value;
	const token = lookup.get(normalizeToken(value));
	if (!token) return value;
	return targetLocale === 'en' ? token.en : token.uk;
};

export function localizeAttributeName(name: string, locale?: string | null) {
	return localizeToken(name, locale, ATTRIBUTE_NAME_LOOKUP);
}

type VariantLabelPart = {
	name?: string | null;
	value?: string | null;
	unit?: string | null;
};

export function buildLocalizedVariantLabel(
	parts: VariantLabelPart[] | null | undefined,
	locale?: string | null
) {
	if (!parts?.length) return null;
	const chunks = parts
		.map((part) => {
			const name = part.name ? localizeAttributeName(part.name, locale).trim() : '';
			const value = (part.value ?? '').trim();
			const unit = part.unit ? (localizeUnit(part.unit, locale) ?? '').trim() : '';
			const valueWithUnit = [value, unit].filter(Boolean).join(' ').trim();
			if (name && valueWithUnit) return `${name}: ${valueWithUnit}`;
			return name || valueWithUnit;
		})
		.filter(Boolean);
	if (!chunks.length) return null;
	return chunks.join(' / ');
}
