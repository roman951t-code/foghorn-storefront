const COMMON_COUNTRY_FALLBACK = [
	'Argentina',
	'Australia',
	'Austria',
	'Belgium',
	'Brazil',
	'Bulgaria',
	'Canada',
	'China',
	'Croatia',
	'Czechia',
	'Denmark',
	'Egypt',
	'Estonia',
	'Finland',
	'France',
	'Germany',
	'Greece',
	'Hungary',
	'India',
	'Ireland',
	'Israel',
	'Italy',
	'Japan',
	'Kazakhstan',
	'Latvia',
	'Lithuania',
	'Mexico',
	'Moldova',
	'Netherlands',
	'New Zealand',
	'Norway',
	'Poland',
	'Portugal',
	'Romania',
	'Slovakia',
	'Slovenia',
	'South Korea',
	'Spain',
	'Sweden',
	'Switzerland',
	'Turkey',
	'Ukraine',
	'United Kingdom',
	'United States',
] as const;

const countryOptionsCache = new Map<string, string[]>();

const getSupportedRegions = (): string[] => {
	if (typeof Intl === 'undefined') return [];
	if (typeof (Intl as any).supportedValuesOf !== 'function') return [];

	try {
		return (Intl as any).supportedValuesOf('region') as string[];
	} catch {
		return [];
	}
};

export const getCountryOptions = (locale?: string): string[] => {
	const resolvedLocale = (locale || 'en').trim().toLowerCase() || 'en';
	const cached = countryOptionsCache.get(resolvedLocale);
	if (cached) return cached;

	const fallback = [...COMMON_COUNTRY_FALLBACK];

	if (typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') {
		countryOptionsCache.set(resolvedLocale, fallback);
		return fallback;
	}

	const regions = getSupportedRegions();
	if (!regions.length) {
		countryOptionsCache.set(resolvedLocale, fallback);
		return fallback;
	}

	try {
		const display = new Intl.DisplayNames([resolvedLocale], { type: 'region' });
		const collator = new Intl.Collator(resolvedLocale);
		const options = Array.from(
			new Set(
				regions
					.map((regionCode) => display.of(regionCode))
					.filter(
						(countryName): countryName is string =>
							typeof countryName === 'string' &&
							countryName.trim().length > 0 &&
							!/^([A-Z]{2}|[0-9]{3})$/.test(countryName)
					)
					.map((countryName) => countryName.trim())
			)
		).sort(collator.compare);

		const finalOptions = options.length ? options : fallback;
		countryOptionsCache.set(resolvedLocale, finalOptions);
		return finalOptions;
	} catch {
		countryOptionsCache.set(resolvedLocale, fallback);
		return fallback;
	}
};

const extractRegionCode = (input: string): string | null => {
	const parts = input.replace('_', '-').split('-');
	const candidate = parts.at(-1)?.toUpperCase();
	if (!candidate || !/^[A-Z]{2}$/.test(candidate)) return null;
	return candidate;
};

export const getCountryFromLocale = (localeInput?: string | null): string | null => {
	const locales = [
		localeInput ?? null,
		typeof navigator !== 'undefined' ? navigator.language : null,
		...(typeof navigator !== 'undefined' && Array.isArray(navigator.languages)
			? navigator.languages
			: []),
	]
		.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
		.map((value) => value.trim());

	if (!locales.length) return null;
	if (typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') return null;

	for (const locale of locales) {
		const regionCode = extractRegionCode(locale);
		if (!regionCode) continue;

		try {
			const display = new Intl.DisplayNames([locale], { type: 'region' });
			const country = display.of(regionCode);
			if (country && !/^([A-Z]{2}|[0-9]{3})$/.test(country)) {
				return country.trim();
			}
		} catch {
			continue;
		}
	}

	return null;
};
