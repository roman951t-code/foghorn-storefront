'use client';

import { createBoundedStore } from './createBoundedStore';
import { EMPTY_SHIPPING_ADDRESS_FORM, type ShippingAddressFormValue } from '@/utils/shippingAddress';

type CheckoutStore = {
	paymentMethod: string;
	shipmentMethod: string;
	shippingAddress: ShippingAddressFormValue;
	couponDraft: string;
	appliedCoupon: { code: string; label: string; amount: number } | null;
	consents: Record<string, boolean>;
	setPaymentMethod: (method: string) => void;
	setShipmentMethod: (method: string) => void;
	setShippingAddress: (value: ShippingAddressFormValue) => void;
	setShippingAddressField: (field: keyof ShippingAddressFormValue, value: string) => void;
	setCouponDraft: (code: string) => void;
	setAppliedCoupon: (coupon: { code: string; label: string; amount: number } | null) => void;
	clearCoupon: () => void;
	setConsent: (key: string, value: boolean) => void;
	resetConsents: () => void;
};

export const useCheckoutStore = createBoundedStore<CheckoutStore>((set) => ({
	paymentMethod: 'paypal',
	shipmentMethod: 'nova-poshta',
	shippingAddress: { ...EMPTY_SHIPPING_ADDRESS_FORM },
	couponDraft: '',
	appliedCoupon: null,
	consents: {},
	setPaymentMethod: (method) => set({ paymentMethod: method }),
	setShipmentMethod: (method) => set({ shipmentMethod: method }),
	setShippingAddress: (value) => set({ shippingAddress: value }),
	setShippingAddressField: (field, value) =>
		set((state) => ({
			shippingAddress: {
				...state.shippingAddress,
				[field]: value,
			},
		})),
	setCouponDraft: (code) => set({ couponDraft: code }),
	setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
	clearCoupon: () => set({ appliedCoupon: null, couponDraft: '' }),
	setConsent: (key, value) =>
		set((state) => ({ consents: { ...state.consents, [key]: value } })),
	resetConsents: () => set({ consents: {} }),
}));
