import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { Badge, Card, Flex, Icon, IconButton, Stack, Stat, Text, VStack } from '@chakra-ui/react';
import CartOrderCard from '@/features/cart/CartOrderCard';
import { LocaleNavButton } from '@/components/ui/links/LocaleNavLink';
import { I18nData } from '@/types/i18n';
import { Dispatch, SetStateAction } from 'react';
import { useCart } from '@/hooks/useCart';
import { calculateCartTotals } from '@/utils/cartTotals';
import CouponField from '@/components/ui/inputs/CouponField';
import { useCheckoutStore } from '@/stores/checkoutStore';
import CountPill from '@/components/ui/CountPill';
import { formatUsdPrice } from '@/utils/priceFormatting';

interface Props {
	i18nData: I18nData;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CartWithProducts({ i18nData, setIsOpen }: Props) {
	const { cartData, handleClearCart } = useCart();
	const { items: cartItems } = cartData;

	const { totalCount, discountedTotal } = calculateCartTotals(cartItems);
	const appliedCoupon = useCheckoutStore((s) => s.appliedCoupon);
	const couponDiscount = appliedCoupon?.amount ?? 0;
	const finalTotal = Math.max(0, discountedTotal - couponDiscount);

	return (
		<Stack gap='4'>
			<Card.Root p='4' borderWidth='1px' borderColor='border' bg='bg.tertiary' rounded='lg'>
				<Flex justifyContent='space-between' alignItems='stretch' gap='4'>
					<VStack alignItems='flex-start' gap='3' flex='1'>
						<Stat.Root>
							<Stat.Label fontSize='md' color='main.disabled'>
								{i18nData.totalAmount}
							</Stat.Label>
							<Stat.ValueText fontSize='2xl'>{formatUsdPrice(finalTotal)}</Stat.ValueText>
						</Stat.Root>
						{couponDiscount > 0 ? (
							<Badge
								variant='solid'
								color='black'
								bg='main.secondary'
								fontWeight='semibold'
								mt='1'
							>{`-${formatUsdPrice(couponDiscount)} ${appliedCoupon?.code ?? ''}`}</Badge>
						) : null}

						<Flex align='center' gapX='2' mt='1'>
							<Text fontSize={{ base: 'md', md: 'sm' }} color='main'>
								{i18nData.numOfProducts}
							</Text>
							<CountPill value={totalCount} px='2' labelProps={{ fontWeight: 'bold' }} />
						</Flex>

						<LocaleNavButton
							display={{ base: 'inline-flex', sm: 'none' }}
							mt='2'
							href='/checkout'
							onClick={() => setIsOpen(false)}
							size='md'
						>
							<FiShoppingCart />
							{i18nData.order}
						</LocaleNavButton>
					</VStack>

					<Flex direction='column' alignItems='flex-end' justifyContent='space-between'>
						<IconButton
							onClick={handleClearCart}
							aria-label='Clear cart'
							variant='outline'
							rounded='md'
						>
							<Icon size='md'>
								<FiTrash2 />
							</Icon>
						</IconButton>

						<LocaleNavButton
							display={{ base: 'none', sm: 'inline-flex' }}
							href='/checkout'
							onClick={() => setIsOpen(false)}
							size='md'
						>
							<FiShoppingCart />
							{i18nData.order}
						</LocaleNavButton>
					</Flex>
				</Flex>

				<Stack mt='6' gap='4'>
					<CouponField subtotal={discountedTotal} layout='responsive' />
				</Stack>
			</Card.Root>

			<Stack direction='column' overflowY='auto' gap={3} pr='1'>
				{cartItems.map((item) => (
					<CartOrderCard
						key={item?.lineId}
						product={item}
						i18nData={i18nData}
						onNavigate={() => setIsOpen(false)}
					/>
				))}
			</Stack>
		</Stack>
	);
}
