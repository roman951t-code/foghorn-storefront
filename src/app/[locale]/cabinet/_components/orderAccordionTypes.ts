import type { IconType } from 'react-icons';

export type TranslateFn = (key: string) => string;

export type OrderDetailTag = {
	key: 'status' | 'payment' | 'shipment';
	label: string;
	value: string;
	colorPalette?: string;
	icon?: IconType | null;
};
