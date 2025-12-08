'use client';

import { createBoundedStore } from './createBoundedStore';

type CheckoutStore = {
	paymentMethod: string;
	shipmentMethod: string;
	setPaymentMethod: (method: string) => void;
	setShipmentMethod: (method: string) => void;
};

export const useCheckoutStore = createBoundedStore<CheckoutStore>((set) => ({
	paymentMethod: 'paypal',
	shipmentMethod: 'nova-poshta',
	setPaymentMethod: (method) => set({ paymentMethod: method }),
	setShipmentMethod: (method) => set({ shipmentMethod: method }),
}));
