import { z } from 'zod';
import { SHIPPING_ADDRESS_FIELD_LIMITS } from '@/utils/shippingAddress';

export const createShippingAddressSchema = (requiredMessage: string) =>
	z.object({
		country: z
			.string()
			.trim()
			.min(1, { message: requiredMessage })
			.max(SHIPPING_ADDRESS_FIELD_LIMITS.country),
		region: z
			.string()
			.trim()
			.min(1, { message: requiredMessage })
			.max(SHIPPING_ADDRESS_FIELD_LIMITS.region),
		city: z
			.string()
			.trim()
			.min(1, { message: requiredMessage })
			.max(SHIPPING_ADDRESS_FIELD_LIMITS.city),
		postalCode: z
			.string()
			.trim()
			.min(1, { message: requiredMessage })
			.max(SHIPPING_ADDRESS_FIELD_LIMITS.postalCode),
		addressLine1: z
			.string()
			.trim()
			.min(1, { message: requiredMessage })
			.max(SHIPPING_ADDRESS_FIELD_LIMITS.addressLine1),
		addressLine2: z.string().trim().max(SHIPPING_ADDRESS_FIELD_LIMITS.addressLine2),
	});
