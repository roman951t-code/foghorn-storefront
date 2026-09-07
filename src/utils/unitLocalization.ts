export function localizeUnit(unit: string | null | undefined, locale: string | null | undefined) {
	if (!unit) return null;

	const normalizedLocale = (locale ?? '').toLowerCase();
	const isEnglish = normalizedLocale.startsWith('en');

	if (!isEnglish) return unit;

	switch (unit) {
		case 'кг':
			return 'kg';
		case 'г':
			return 'g';
		case 'мм':
			return 'mm';
		case 'мА·г':
			return 'mAh';
		case 'ГБ':
			return 'GB';
		case 'Гц':
			return 'Hz';
		case '"':
		case '″':
			return 'in';
		default:
			return unit;
	}
}

