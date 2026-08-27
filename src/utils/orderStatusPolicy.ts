const CUSTOMER_CANCELLABLE_ORDER_STATUSES = new Set(['pending']);
const CUSTOMER_DELETABLE_ORDER_STATUSES = new Set(['cancelled']);

const normalizeOrderStatus = (value: string | null | undefined) =>
	typeof value === 'string' ? value.trim().toLowerCase() : '';

export function isCustomerOrderCancellable(status: string | null | undefined): boolean {
	return CUSTOMER_CANCELLABLE_ORDER_STATUSES.has(normalizeOrderStatus(status));
}

export function isCustomerOrderDeletable(status: string | null | undefined): boolean {
	return CUSTOMER_DELETABLE_ORDER_STATUSES.has(normalizeOrderStatus(status));
}
