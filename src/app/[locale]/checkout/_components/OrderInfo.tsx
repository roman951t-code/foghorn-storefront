'use client';

import {
	Heading,
	Text,
	VStack,
	Flex,
	Stack,
	Highlight,
	Separator,
	Stat,
	Box,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { SidebarCheckoutCard, FullCheckoutCard } from '@/features/checkout/CheckoutCard';
import AcceptOrderBtn from './AcceptOrderBtn';
import { useCart } from '@/hooks/useCart';
import { calculateCartTotals } from '@/utils/cartTotals';
import { useSession } from '@/providers/SessionProvider';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { createOrderAction } from '@/actions/createOrderAction';
import { useState, useTransition } from 'react';
import { showToaster } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import CouponField from '@/components/ui/inputs/CouponField';
import CheckoutConsents from './CheckoutConsents';
import type { StorefrontFormPublic } from '@/actions/storefront/getEnabledStorefrontForms';
import { isBlockingCheckoutConsent } from './checkoutConsentUtils';

export default function OrderInfo({
	storefrontForms = [],
}: {
	storefrontForms?: StorefrontFormPublic[];
}) {
	const { session } = useSession();
	const checkoutT = useTranslations('checkout');
	const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
	const shipmentMethod = useCheckoutStore((state) => state.shipmentMethod);
	const appliedCoupon = useCheckoutStore((state) => state.appliedCoupon);
	const consents = useCheckoutStore((state) => state.consents);
	const [isSubmitting, startTransition] = useTransition();
	const [isStripeRedirecting, setIsStripeRedirecting] = useState(false);
	const router = useRouter();
	const isLoading = isSubmitting || isStripeRedirecting;

	const isAuthorized = !!session?.session;
	const user = session?.user;

	const t = useTranslations('products');
	const commonT = useTranslations('common');
	const { cartData, handleClearCart } = useCart();
	const cartItems = cartData.items;
	const { totalCount, baseTotal, discountedTotal, discountTotal } = calculateCartTotals(cartItems);
	const unitsLabel = commonT('units');
	const productsLabel = `${t('productsInCart')}: ${totalCount} ${unitsLabel}`;
	const orderSumText = `${baseTotal.toFixed(2)} ₴`;
	const discountText = `${
		discountTotal > 0 ? `-${discountTotal.toFixed(2)}` : discountTotal.toFixed(2)
	} ₴`;
	const couponDiscount = appliedCoupon?.amount ?? 0;
	const couponText = `${
		couponDiscount > 0 ? `-${couponDiscount.toFixed(2)}` : couponDiscount.toFixed(2)
	} ₴`;
	const totalDiscount = discountTotal + couponDiscount;
	const totalDiscountText = `${
		totalDiscount > 0 ? `-${totalDiscount.toFixed(2)}` : totalDiscount.toFixed(2)
	} ₴`;
	const finalTotal = Math.max(0, discountedTotal - couponDiscount);
	const totalAmountText = `${finalTotal.toFixed(2)} ₴`;
	const hasContactData = Boolean(
		user?.name?.trim() &&
			user?.lastName?.trim() &&
			user?.middleName?.trim() &&
			(user?.phoneNumber?.trim() || user?.email?.trim())
	);

	const requiredForms = storefrontForms.filter(isBlockingCheckoutConsent);
	const missingRequiredConsents = requiredForms.filter((f) => consents[f.key] !== true);

	const disabledReason: 'auth' | 'contacts' | 'empty' | 'consents' | null = !isAuthorized
		? 'auth'
		: !hasContactData
		? 'contacts'
		: cartItems.length === 0
		? 'empty'
		: missingRequiredConsents.length > 0
		? 'consents'
		: null;

	const handleAcceptOrder = () => {
		if (disabledReason || !cartItems.length) return;

		const orderItems = cartItems.map((item) => ({
			productId: item.productId,
			variantId: item.variantId,
			quantity: Math.max(1, item.quantity ?? 1),
		}));

		const rawCouponCode = useCheckoutStore.getState().appliedCoupon?.code ?? '';
		const couponCode = rawCouponCode.trim() ? rawCouponCode.trim() : undefined;

		if (paymentMethod === 'card') {
			startStripeCheckout(orderItems, couponCode);
			return;
		}

		startTransition(() => {
			(async () => {
				const result = await createOrderAction(null, {
					items: orderItems,
					paymentMethod,
					shipmentMethod,
					couponCode,
				});

				if (result?.success) {
					showToaster('success', checkoutT('orderCreated'));
					await handleClearCart();
					useCheckoutStore.getState().clearCoupon();
					useCheckoutStore.getState().resetConsents();
					router.push('/cabinet/orders');
				} else {
					showToaster('error', checkoutT('orderCreateFail'));
				}
			})();
		});
	};

	const startStripeCheckout = async (
		orderItems: { productId: string; variantId: string | null; quantity: number }[],
		couponCode?: string
	) => {
		try {
			setIsStripeRedirecting(true);

			const origin = window.location.origin;
			const response = await fetch('/api/payments/stripe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					items: orderItems,
					successUrl: `${origin}/cabinet/orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
					cancelUrl: `${origin}/checkout?cancelled=1`,
					couponCode,
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				const message = data?.error ?? 'stripe_session_failed';
				throw new Error(message);
			}

			const checkoutUrl =
				(typeof data.url === 'string' && data.url) ??
				(data.sessionId ? `https://checkout.stripe.com/c/pay/${data.sessionId}` : null);

			if (!checkoutUrl) {
				throw new Error('stripe_redirect_failed');
			}

			window.location.assign(checkoutUrl);
			return;
		} catch (error) {
			console.error('Stripe checkout error', error);
			const message = error instanceof Error ? error.message : 'stripe_session_failed';
			showToaster('error', checkoutT('orderCreateFail') + ` (${message})`);
		} finally {
			setIsStripeRedirecting(false);
		}
	};

	return (
		<Flex direction='column' gapY='3' w='100%' gap={2} p={{ base: 0, lg: 4 }}>
			<Heading as='h3' mt='4' size='2xl' fontWeight='medium' textAlign='center'>
				{t('yourOrder')}
			</Heading>
			<Separator my='2' color='border' />
			<Box w='full' maxW='400px'>
				<CouponField subtotal={discountedTotal} layout='column' />
			</Box>

			<Separator my='2' color='border' />
			<Box maxH='600px' overflowY='auto' hideBelow='lg'>
				{cartItems.map((item, idx) => (
					<SidebarCheckoutCard
						key={item.lineId}
						product={item}
						showSeparator={cartItems.length > 1 && idx < cartItems.length - 1}
					/>
				))}
			</Box>
			<Box
				maxH='608px'
				overflowY='auto'
				hideFrom='lg'
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
				rounded='lg'
				bg='bg.tertiary'
			>
				{cartItems.map((item, idx) => (
					<FullCheckoutCard
						key={item.lineId}
						product={item}
						showSeparator={cartItems.length > 1 && idx < cartItems.length - 1}
					/>
				))}
			</Box>

			<VStack mt='4' alignItems='flex-start' hideBelow='lg'>
				<Text>
					<Highlight query={`${totalCount} ${unitsLabel}`} styles={{ fontWeight: 'semibold' }}>
						{productsLabel}
					</Highlight>
				</Text>
				<Text>
					<Highlight query={orderSumText} styles={{ fontWeight: 'semibold' }}>
						{`${t('orderSum')}: ${orderSumText}`}
					</Highlight>
				</Text>

				<Text>
					<Highlight
						query={discountText}
						styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}
					>
						{`${t('discountSum')}: ${discountText}`}
					</Highlight>
				</Text>
				{couponDiscount > 0 ? (
					<Text>
						<Highlight
							query={couponText}
							styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}
						>
							{`${checkoutT('couponLine')}: ${couponText}`}
						</Highlight>
					</Text>
				) : null}
				{couponDiscount > 0 ? (
					<Text>
						<Highlight
							query={totalDiscountText}
							styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}
						>
							{`${t('totalDiscount')}: ${totalDiscountText}`}
						</Highlight>
					</Text>
				) : null}
				<Separator w='full' mt='2' color='border' />
				<Stat.Root mt='2'>
					<Stat.Label fontSize='sm'>{t('totalAmount')}</Stat.Label>
					<Stat.ValueText fontSize='3xl'>{totalAmountText}</Stat.ValueText>
				</Stat.Root>
				<Box mt='4'>
					<CheckoutConsents forms={storefrontForms} />
				</Box>

				<AcceptOrderBtn
					text={t('acceptOrder')}
					w='100%'
					mt='4'
					disabledReason={disabledReason}
					loading={isLoading}
					onAccept={handleAcceptOrder}
				/>
			</VStack>
			<Box my='4' hideFrom='lg'>
				<CheckoutConsents forms={storefrontForms} />
			</Box>

			<Stack
				hideFrom='lg'
				justifyContent='space-between'
				alignItems='flex-start'
				mt='4'
				direction={{ base: 'column', sm: 'row' }}
			>
				<VStack alignItems='flex-start' order={{ base: 2, sm: 1 }} gapY='6'>
					<Stat.Root mt={{ base: 2, sm: 0 }}>
						<Stat.Label fontSize='sm'>{t('totalAmount')}</Stat.Label>
						<Stat.ValueText fontSize='3xl'>{totalAmountText}</Stat.ValueText>
					</Stat.Root>

					<AcceptOrderBtn
						text={t('acceptOrder')}
						disabledReason={disabledReason}
						loading={isLoading}
						onAccept={handleAcceptOrder}
					/>
				</VStack>
				<VStack
					alignItems={{ base: 'flex-start', sm: 'flex-end' }}
					order={{ base: 1, sm: 2 }}
					gap='3'
					textAlign='right'
					minW='240px'
				>
					<Text>
						<Highlight query={`${totalCount} ${unitsLabel}`} styles={{ fontWeight: 'semibold' }}>
							{productsLabel}
						</Highlight>
					</Text>
					<Text>
						<Highlight query={orderSumText} styles={{ fontWeight: 'semibold' }}>
							{`${t('orderSum')}: ${orderSumText}`}
						</Highlight>
					</Text>

					<Text>
						<Highlight
							query={discountText}
							styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}
						>
							{`${t('discountSum')}: ${discountText}`}
						</Highlight>
					</Text>
					{couponDiscount > 0 ? (
						<Text>
							<Highlight
								query={couponText}
								styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}
							>
								{`${checkoutT('couponLine')}: ${couponText}`}
							</Highlight>
						</Text>
					) : null}
					{couponDiscount > 0 ? (
						<Text>
							<Highlight
								query={totalDiscountText}
								styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}
							>
								{`${t('totalDiscount')}: ${totalDiscountText}`}
							</Highlight>
						</Text>
					) : null}
				</VStack>
			</Stack>
		</Flex>
	);
}
