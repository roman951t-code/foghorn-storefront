import type { ShowPropertyProps } from 'adminjs';

const formatMoney = (value: number, currency = 'UAH') => {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	} catch {
		return value.toFixed(2);
	}
};

export default function OrderTotalList(props: ShowPropertyProps) {
	const { record, property } = props;
	const raw = record.params[property.path];
	const numeric = Number(raw ?? 0);
	if (!Number.isFinite(numeric)) {
		return String(raw ?? '');
	}
	return formatMoney(numeric);
}
