import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { getTranslations } from 'next-intl/server';
import type { UserOrder } from '@/types/order';
import { APP_URL } from '@/config/env';
import { STORE_CURRENCY_CODE } from '@/config/currency';
import { LOCALE_TO_INTL_MAP, resolveAppLocale } from '@/constants/locales';
import { DEFAULT_FROM, renderEmailTemplate, resendClient } from '@/lib/emailTemplates';
import { formatCurrencyPrice } from '@/utils/priceFormatting';

const formatCurrency = (value: number, intlLocale: string) =>
	formatCurrencyPrice(value, {
		locale: intlLocale,
		currency: STORE_CURRENCY_CODE,
	});

const formatDateTime = (date: Date, intlLocale: string) =>
	new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);

type SendOrderEmailParams = {
	order: UserOrder;
	email?: string | null;
	name?: string | null;
	// The locale the customer was actually using when they placed the order
	// (e.g. createOrderAction's `parsed.data.locale`, or the Stripe checkout
	// session's stored locale) — NOT derived from the request's
	// Accept-Language header. A browser's Accept-Language reflects OS/browser
	// settings, which routinely differs from the site locale the customer had
	// manually switched to, and previously sent nearly every non-Ukrainian
	// customer a Ukrainian-language confirmation email.
	locale: string;
};

export async function sendOrderConfirmationEmail({ order, email, name, locale }: SendOrderEmailParams) {
	if (!email) return;

	const resolvedLocale = resolveAppLocale(locale);
	const intlLocale = LOCALE_TO_INTL_MAP[resolvedLocale];
	const [emailsT, checkoutT] = await Promise.all([
		getTranslations({ namespace: 'emails', locale: resolvedLocale }),
		getTranslations({ namespace: 'checkout', locale: resolvedLocale }),
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
		{ label: emailsT('placedOn'), value: formatDateTime(order.createdAt ?? new Date(), intlLocale) },
		{ label: emailsT('orderPaymentMethod'), value: paymentMethod },
		{ label: emailsT('orderTotalLabel'), value: formatCurrency(order.total ?? 0, intlLocale) },
	];

	const listItems =
		order.items?.map((item) => {
			const linePrice = item.price || item.unitPrice * item.quantity;
			return `${item.product?.name ?? emailsT('items')} ×${item.quantity} — ${formatCurrency(
				linePrice,
				intlLocale
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
		Sentry.captureException(error, { tags: { emailType: 'order-confirmation' } });
	}
}
