const DEFAULT_DECIMALS = 2;

export const roundPrice = (value: number, decimals = DEFAULT_DECIMALS): number => {
	if (!Number.isFinite(value)) return 0;
	const factor = 10 ** decimals;
	return Math.round((value + Number.EPSILON) * factor) / factor;
};

// Prisma's Decimal (and any other decimal-like value) exposes .toNumber(),
// but order/coupon data also passes through plain numbers, bigints, and
// strings (e.g. after JSON serialization), so this normalizes all of them.
export const toNumber = (value: unknown): number => {
	if (typeof value === 'number') return value;
	if (typeof value === 'bigint') return Number(value);
	if (typeof value === 'string') return Number(value);
	if (
		value &&
		typeof value === 'object' &&
		'toNumber' in value &&
		typeof (value as { toNumber: unknown }).toNumber === 'function'
	) {
		return (value as { toNumber: () => number }).toNumber();
	}
	return Number(value);
};

const formatPriceAmount = (value: number, decimals = DEFAULT_DECIMALS): string => {
	const rounded = roundPrice(value, decimals);
	return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
};

export const formatUsdPrice = (value: number): string => {
	const rounded = roundPrice(value);
	const sign = rounded < 0 ? '-' : '';
	return `${sign}$${formatPriceAmount(Math.abs(rounded))}`;
};

export const formatCurrencyPrice = (
	value: number,
	options: {
		locale: string;
		currency: string;
		currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
	}
): string => {
	const rounded = roundPrice(value);
	const isInteger = Number.isInteger(rounded);

	return new Intl.NumberFormat(options.locale, {
		style: 'currency',
		currency: options.currency,
		currencyDisplay: options.currencyDisplay ?? 'symbol',
		minimumFractionDigits: isInteger ? 0 : DEFAULT_DECIMALS,
		maximumFractionDigits: DEFAULT_DECIMALS,
	}).format(rounded);
};
