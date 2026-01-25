import type { ShowPropertyProps } from 'adminjs';

const formatMoney = (value: number, currency = 'UAH') => {
	const safeValue = Number.isFinite(value) ? value : 0;
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(safeValue);
	} catch {
		return safeValue.toFixed(2);
	}
};

export default function OrderTotalList(props: ShowPropertyProps) {
	const { record, property } = props;
	const raw = record.params[property.path];
	const numeric = Number(raw ?? 0);
	return formatMoney(numeric);
}
