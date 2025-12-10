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
import DisabledCheckoutNotice from './DisabledCheckoutNotice';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { createOrderAction } from '@/actions/createOrderAction';
import { useState, useTransition } from 'react';
import { showToaster } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { getStripe } from '@/utils/getStripe';

export default function OrderInfo() {
	const { session } = useSession();
	const checkoutT = useTranslations('checkout');
	const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
	const shipmentMethod = useCheckoutStore((state) => state.shipmentMethod);
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
	const totalAmountText = `${discountedTotal.toFixed(2)} ₴`;
	const hasContactData = Boolean(
		user?.name?.trim() &&
			user?.lastName?.trim() &&
			user?.middleName?.trim() &&
			(user?.phoneNumber?.trim() || user?.email?.trim())
	);

	const disabledReason: 'auth' | 'contacts' | 'empty' | null = !isAuthorized
		? 'auth'
		: !hasContactData
		? 'contacts'
		: cartItems.length === 0
		? 'empty'
		: null;

	const noticeTitle =
		disabledReason === 'auth'
			? checkoutT('signinRequiredTitle')
			: disabledReason === 'contacts'
			? checkoutT('contactRequiredTitle')
			: null;
	const noticeDescription =
		disabledReason === 'auth'
			? checkoutT('signinRequiredDesc')
			: disabledReason === 'contacts'
			? checkoutT('contactRequiredDesc')
			: null;

	const handleAcceptOrder = () => {
		if (disabledReason || !cartItems.length) return;

		const orderItems = cartItems.map((item) => ({
			productId: item.id,
			quantity: Math.max(1, item.quantity ?? 1),
		}));

		if (paymentMethod === 'card') {
			startStripeCheckout(orderItems);
			return;
		}

		startTransition(() => {
			(async () => {
				const result = await createOrderAction(null, {
					items: orderItems,
					paymentMethod,
					shipmentMethod,
				});

				if (result?.success) {
					showToaster('success', checkoutT('orderCreated'));
					await handleClearCart();
					router.push('/cabinet/orders');
				} else {
					showToaster('error', checkoutT('orderCreateFail'));
				}
			})();
		});
	};

	const startStripeCheckout = async (orderItems: { productId: string; quantity: number }[]) => {
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
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				const message = data?.error ?? 'stripe_session_failed';
				throw new Error(message);
			}

			const stripe = await getStripe();

			if (stripe && data.sessionId) {
				const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
				if (error) {
					throw new Error(error.message);
				}
				return;
			}

			if (data.url) {
				window.location.href = data.url as string;
				return;
			}

			throw new Error('stripe_redirect_failed');
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
			<Separator my='2' color='border.dark' />
			<Box maxH='600px' overflowY='auto' hideBelow='lg'>
				{cartItems.map((item, idx) => (
					<SidebarCheckoutCard
						key={item.id}
						product={item}
						showSeparator={cartItems.length > 1 && idx < cartItems.length - 1}
					/>
				))}
			</Box>
			<Box maxH='600px' overflowY='auto' hideFrom='lg' shadow='sm'>
				{cartItems.map((item, idx) => (
					<FullCheckoutCard
						key={item.id}
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
				<Separator w='full' mt='2' color='border.dark' />
				<Stat.Root mt='2'>
					<Stat.Label fontSize='sm'>{t('totalAmount')}</Stat.Label>
					<Stat.ValueText fontSize='3xl'>{`${discountedTotal.toFixed(2)} ₴`}</Stat.ValueText>
				</Stat.Root>
				<AcceptOrderBtn
					text={t('acceptOrder')}
					w='100%'
					mt='4'
					disabledReason={disabledReason}
					loading={isLoading}
					onAccept={handleAcceptOrder}
				/>
				<DisabledCheckoutNotice title={noticeTitle} description={noticeDescription} />
			</VStack>

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
					<DisabledCheckoutNotice title={noticeTitle} description={noticeDescription} />
				</VStack>
				<VStack
					alignItems={{ base: 'flex-start', sm: 'flex-end' }}
					order={{ base: 1, sm: 2 }}
					gap='3'
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
				</VStack>
			</Stack>
		</Flex>
	);
}
