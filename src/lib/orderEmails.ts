import 'server-only';

import { headers as getHeaders } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import type { UserOrder } from '@/types/order';
import { APP_URL } from '@/config/env';
import { STORE_CURRENCY_CODE } from '@/config/currency';
import { DEFAULT_FROM, renderEmailTemplate, resendClient } from '@/lib/emailTemplates';
import { formatCurrencyPrice } from '@/utils/priceFormatting';

const FALLBACK_LOCALE = 'en';

type HeaderLike = { get(name: string): string | null };
type HeaderSource = HeaderLike | Promise<HeaderLike>;

const resolveHeaders = async (headersList?: HeaderSource): Promise<HeaderLike> => {
	if (!headersList) return getHeaders();
	if (typeof (headersList as any).then === 'function') {
		return await headersList;
	}
	return headersList;
};

const getLocale = async (headersList?: HeaderSource) => {
	const headers = await resolveHeaders(headersList);
	const raw = headers.get('accept-language') ?? headers.get('Accept-Language') ?? undefined;
	return raw?.split(',')?.[0]?.trim() || FALLBACK_LOCALE;
};

const formatCurrency = (value: number, locale: string) =>
	formatCurrencyPrice(value, {
		locale,
		currency: STORE_CURRENCY_CODE,
	});

const formatDateTime = (date: Date, locale: string) =>
	new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);

type SendOrderEmailParams = {
	order: UserOrder;
	email?: string | null;
	name?: string | null;
	headersList?: HeaderSource;
};

export async function sendOrderConfirmationEmail({
	order,
	email,
	name,
	headersList,
}: SendOrderEmailParams) {
	if (!email) return;

	const headers = await resolveHeaders(headersList);
	const locale = await getLocale(headers);
	const [emailsT, checkoutT] = await Promise.all([
		getTranslations({ namespace: 'emails', locale }),
		getTranslations({ namespace: 'checkout', locale }),
	]);

	const orderNumber = order.orderNumber ?? order.id;
	const paymentMethod =
		order.paymentMethod === 'card'
			? checkoutT('payment.card')
			: order.paymentMethod === 'paypal'
				? checkoutT('payment.paypal')
				: order.paymentMethod === 'cod'
					? checkoutT('payment.cod')
					: order.paymentMethod ?? emailsT('notProvided');

	const detailRows = [
		{ label: emailsT('orderNumberLabel'), value: orderNumber ?? '' },
		{ label: emailsT('placedOn'), value: formatDateTime(order.createdAt ?? new Date(), locale) },
		{ label: emailsT('orderPaymentMethod'), value: paymentMethod },
		{ label: emailsT('orderTotalLabel'), value: formatCurrency(order.total ?? 0, locale) },
	];

	const listItems =
		order.items?.map((item) => {
			const linePrice = item.price || item.unitPrice * item.quantity;
			return `${item.product?.name ?? emailsT('items')} ×${item.quantity} — ${formatCurrency(
				linePrice,
				locale
			)}`;
		}) ?? [];

	const salutationName = name || email || emailsT('defaultRecipient');
	const orderUrl = `${APP_URL}/cabinet/orders`;

	const emailContent = renderEmailTemplate({
		subject: emailsT('orderConfirmedSubject', { orderNumber }),
		title: emailsT('orderConfirmedTitle'),
		salutation: `${emailsT('greeting')} ${salutationName},`,
		intro: [emailsT('orderConfirmedIntro')],
		detailRows,
		listTitle: emailsT('orderSummary'),
		listItems,
		outro: [emailsT('orderThanks'), emailsT('help')],
		cta: { label: emailsT('viewOrderCta'), url: orderUrl },
		footer: emailsT('signature'),
		brandName: emailsT('brandName'),
	});

	try {
		await resendClient.emails.send({
			from: DEFAULT_FROM,
			to: [email],
			subject: emailContent.subject,
			html: emailContent.html,
			text: emailContent.text,
		});
	} catch (error) {
		console.error('Failed to send order confirmation email', error);
	}
}
