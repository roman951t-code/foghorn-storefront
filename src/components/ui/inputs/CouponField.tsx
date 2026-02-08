'use client';

import { Card, Flex, Highlight, IconButton, Input, Stack, Tag, Text } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { showToaster } from '@/utils/toast';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { previewCoupon } from '@/actions/checkout/previewCoupon';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';

type Props = {
	subtotal: number;
	layout?: 'row' | 'column' | 'responsive';
};

const errorKey = (code: string) => {
	switch (code) {
		case 'coupon_not_found':
			return 'couponErrorNotFound';
		case 'coupon_inactive':
			return 'couponErrorInactive';
		case 'coupon_not_started':
			return 'couponErrorNotStarted';
		case 'coupon_expired':
			return 'couponErrorExpired';
		case 'coupon_maxed':
			return 'couponErrorMaxed';
		case 'promotion_inactive':
			return 'couponErrorPromotionInactive';
		case 'promotion_not_started':
			return 'couponErrorPromotionNotStarted';
		case 'promotion_expired':
			return 'couponErrorPromotionExpired';
		case 'min_order_total':
			return 'couponErrorMinTotal';
		case 'discount_zero':
			return 'couponErrorNoDiscount';
		default:
			return 'couponErrorInvalid';
	}
};

export default function CouponField({ subtotal, layout = 'row' }: Props) {
	const t = useTranslations('checkout');
	const draft = useCheckoutStore((s) => s.couponDraft);
	const appliedCoupon = useCheckoutStore((s) => s.appliedCoupon);
	const setCouponDraft = useCheckoutStore((s) => s.setCouponDraft);
	const setAppliedCoupon = useCheckoutStore((s) => s.setAppliedCoupon);
	const clearCoupon = useCheckoutStore((s) => s.clearCoupon);

	const [isApplying, setIsApplying] = useState(false);
	const isColumn = layout === 'column';
	const isResponsive = layout === 'responsive';

	const handleApply = async () => {
		const code = draft.trim();
		if (!code) {
			showToaster('error', t('couponErrorEmpty'));
			return;
		}
		if (subtotal <= 0) {
			showToaster('error', t('couponErrorEmptyCart'));
			return;
		}
		setIsApplying(true);
		try {
			const res = await previewCoupon(null, { code, subtotal });
			if (!res.success) {
				showToaster('error', t(errorKey(res.error)));
				return;
			}
			setAppliedCoupon({
				code: res.coupon.code,
				label: res.coupon.label,
				amount: res.coupon.amount,
			});
			setCouponDraft(res.coupon.code);
			showToaster('success', t('couponApplied'));
		} catch {
			showToaster('error', t('couponErrorInvalid'));
		} finally {
			setIsApplying(false);
		}
	};

	const handleClear = () => {
		clearCoupon();
		showToaster('success', t('couponRemoved'));
	};

	return (
		<Card.Root
			w='full'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			bg='bg.tertiary'
			boxShadow='none'
			p='4'
		>
			<Stack gap='3'>
				<Flex justifyContent='space-between' alignItems='center' gap='3' flexWrap='wrap'>
					<Text fontWeight='semibold' color='main'>
						{t('couponTitle')}
					</Text>
					{appliedCoupon ? (
						<Tag.Root
							variant='surface'
							borderWidth='0.5px'
							boxShadow='none'
							bg='bg.tertiary'
							borderColor='border'
							size='lg'
							color='main'
							py='1'
						>
							<Tag.Label fontSize='sm' fontWeight='semibold'>
								{appliedCoupon.code}
							</Tag.Label>
							<IconButton
								aria-label={t('couponRemove')}
								variant='ghost'
								size='xs'
								rounded='md'
								onClick={handleClear}
							>
								<FiX />
							</IconButton>
						</Tag.Root>
					) : null}
				</Flex>

				<Stack
					direction={isResponsive ? { base: 'column', sm: 'row' } : isColumn ? 'column' : 'row'}
					gapX='4'
					alignItems='stretch'
					w='full'
				>
					<Input
						value={draft}
						onChange={(e) => setCouponDraft(e.target.value)}
						placeholder={t('couponPlaceholder')}
						autoComplete='off'
					/>
					<SecondaryButton
						onClick={handleApply}
						loading={isApplying}
						disabled={isApplying || draft.trim().length === 0}
						w={isResponsive ? { base: 'full', sm: 'auto' } : isColumn ? 'full' : undefined}
					>
						{t('couponApply')}
					</SecondaryButton>
				</Stack>

					{appliedCoupon ? (
						<Text>
							<Highlight
								query={appliedCoupon.amount.toFixed(2)}
								styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}
							>
								{`${t('couponSavings')}: -$${appliedCoupon.amount.toFixed(2)}`}
							</Highlight>
						</Text>
					) : (
					<Text fontSize='sm' color='fg.muted'>
						{t('couponHint')}
					</Text>
				)}
			</Stack>
		</Card.Root>
	);
}
