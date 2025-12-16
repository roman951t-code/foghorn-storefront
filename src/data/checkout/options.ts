import { IconType } from 'react-icons';
import { RiBankCardFill, RiMoneyDollarCircleFill, RiPaypalFill } from 'react-icons/ri';
import { FaTruck } from 'react-icons/fa';

type CheckoutOption = {
	value: string;
	labelKey: string;
	icon: IconType;
};

export const PAYMENT_OPTIONS: CheckoutOption[] = [
	{ value: 'paypal', labelKey: 'payment.paypal', icon: RiPaypalFill },
	{ value: 'cod', labelKey: 'payment.cod', icon: RiMoneyDollarCircleFill },
	{ value: 'card', labelKey: 'payment.card', icon: RiBankCardFill },
];

export const SHIPMENT_OPTIONS: CheckoutOption[] = [
	{ value: 'nova-poshta', labelKey: 'shipment.novaPoshta', icon: FaTruck },
	{ value: 'ukrposhta', labelKey: 'shipment.ukrposhta', icon: FaTruck },
	{ value: 'meest', labelKey: 'shipment.meest', icon: FaTruck },
];
