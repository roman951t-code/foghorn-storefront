import { RiBankCardFill, RiMoneyDollarCircleFill, RiPaypalFill } from 'react-icons/ri';
import { FaTruck } from 'react-icons/fa';

export const getOrderStatusLabel = (status: string, t: (key: string) => string) => {
	const key = status?.toLowerCase() ?? 'pending';
	const lookup: Record<string, string> = {
		pending: 'pending',
		paid: 'paid',
		shipped: 'shipped',
		delivered: 'delivered',
		cancelled: 'cancelled',
	};
	const translationKey = lookup[key] ?? 'pending';
	return t(translationKey);
};

export const formatMethodLabel = (value?: string | null) =>
	value
		? value
				.replace(/[_-]/g, ' ')
				.split(' ')
				.filter(Boolean)
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(' ')
		: '';

const normalizeKey = (value?: string | null) =>
	value
		? value
				.toLowerCase()
				.replace(/[_\s]+/g, '-')
				.trim()
		: '';

export const getPaymentIcon = (value?: string | null) => {
	const key = normalizeKey(value);
	if (key === 'paypal') return RiPaypalFill;
	if (key === 'cod') return RiMoneyDollarCircleFill;
	if (key === 'card') return RiBankCardFill;
	return null;
};

export const getShipmentIcon = (value?: string | null) => {
	const key = normalizeKey(value);
	if (key === 'nova-poshta' || key === 'ukrposhta' || key === 'meest') return FaTruck;
	return null;
};
