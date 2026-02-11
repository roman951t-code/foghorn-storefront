export type ShippingAddressInput = {
	country?: string | null;
	region?: string | null;
	city?: string | null;
	postalCode?: string | null;
	addressLine1?: string | null;
	addressLine2?: string | null;
};

export type ShippingAddressFormValue = {
	country: string;
	region: string;
	city: string;
	postalCode: string;
	addressLine1: string;
	addressLine2: string;
};

export const REQUIRED_SHIPPING_ADDRESS_FIELDS = [
	'country',
	'region',
	'city',
	'postalCode',
	'addressLine1',
] as const;
export type RequiredShippingAddressField = (typeof REQUIRED_SHIPPING_ADDRESS_FIELDS)[number];

export type NormalizedShippingAddress = {
	country: string | null;
	region: string | null;
	city: string | null;
	postalCode: string | null;
	addressLine1: string | null;
	addressLine2: string | null;
	fullAddress: string | null;
};

type ShippingAddressFieldLimits = {
	country: number;
	region: number;
	city: number;
	postalCode: number;
	addressLine1: number;
	addressLine2: number;
	fullAddress: number;
};

export const SHIPPING_ADDRESS_FIELD_LIMITS: ShippingAddressFieldLimits = {
	country: 80,
	region: 120,
	city: 120,
	postalCode: 32,
	addressLine1: 180,
	addressLine2: 180,
	fullAddress: 500,
};

export const EMPTY_SHIPPING_ADDRESS_FORM: ShippingAddressFormValue = {
	country: '',
	region: '',
	city: '',
	postalCode: '',
	addressLine1: '',
	addressLine2: '',
};

const normalizeText = (value: unknown, maxLength: number): string | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
};

const buildFullAddress = (value: Omit<NormalizedShippingAddress, 'fullAddress'>): string | null => {
	const composed = [
		value.addressLine1,
		value.addressLine2,
		value.city,
		value.region,
		value.postalCode,
		value.country,
	]
		.filter(Boolean)
		.join(', ')
		.trim();

	if (!composed) return null;
	return composed.length > SHIPPING_ADDRESS_FIELD_LIMITS.fullAddress
		? composed.slice(0, SHIPPING_ADDRESS_FIELD_LIMITS.fullAddress)
		: composed;
};

export const normalizeShippingAddress = (
	value: ShippingAddressInput | string | null | undefined
): NormalizedShippingAddress => {
	if (typeof value === 'string') {
		const fullAddress = normalizeText(value, SHIPPING_ADDRESS_FIELD_LIMITS.fullAddress);
		const addressLine1 = normalizeText(value, SHIPPING_ADDRESS_FIELD_LIMITS.addressLine1);
		return {
			country: null,
			region: null,
			city: null,
			postalCode: null,
			addressLine1,
			addressLine2: null,
			fullAddress,
		};
	}

	const country = normalizeText(value?.country, SHIPPING_ADDRESS_FIELD_LIMITS.country);
	const region = normalizeText(value?.region, SHIPPING_ADDRESS_FIELD_LIMITS.region);
	const city = normalizeText(value?.city, SHIPPING_ADDRESS_FIELD_LIMITS.city);
	const postalCode = normalizeText(value?.postalCode, SHIPPING_ADDRESS_FIELD_LIMITS.postalCode);
	const addressLine1 = normalizeText(value?.addressLine1, SHIPPING_ADDRESS_FIELD_LIMITS.addressLine1);
	const addressLine2 = normalizeText(value?.addressLine2, SHIPPING_ADDRESS_FIELD_LIMITS.addressLine2);

	const normalized = {
		country,
		region,
		city,
		postalCode,
		addressLine1,
		addressLine2,
	};

	return {
		...normalized,
		fullAddress: buildFullAddress(normalized),
	};
};

export const getMissingRequiredShippingAddressFields = (
	value: ShippingAddressInput | string | null | undefined
): RequiredShippingAddressField[] => {
	const normalized = normalizeShippingAddress(value);

	return REQUIRED_SHIPPING_ADDRESS_FIELDS.filter((field) => !normalized[field]);
};

export const hasRequiredShippingAddressFields = (
	value: ShippingAddressInput | string | null | undefined
): boolean => getMissingRequiredShippingAddressFields(value).length === 0;

export const toShippingAddressFormValue = (
	value: ShippingAddressInput | string | null | undefined
): ShippingAddressFormValue => {
	const normalized = normalizeShippingAddress(value);

	return {
		country: normalized.country ?? '',
		region: normalized.region ?? '',
		city: normalized.city ?? '',
		postalCode: normalized.postalCode ?? '',
		addressLine1: normalized.addressLine1 ?? '',
		addressLine2: normalized.addressLine2 ?? '',
	};
};
