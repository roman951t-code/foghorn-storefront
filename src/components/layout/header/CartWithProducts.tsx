import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import {
	Card,
	Flex,
	Icon,
	IconButton,
	Separator,
	Stack,
	Stat,
	Text,
	VStack,
} from '@chakra-ui/react';
import CartOrderCard from '@/features/cart/CartOrderCard';
import { LocaleNavButton } from '@/components/ui/links/LocaleNavLink';
import { I18nData } from '@/types/i18n';
import { Dispatch, SetStateAction } from 'react';
import { useCart } from '@/hooks/useCart';
import { calculateCartTotals } from '@/utils/cartTotals';
import CouponField from '@/components/ui/inputs/CouponField';
import { useCheckoutStore } from '@/stores/checkoutStore';
import CountPill from '@/components/ui/CountPill';

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
		<Stack gap='4' pt='2'>
			<Card.Root p='4' borderWidth='1px' borderColor='border' bg='bg.tertiary' rounded='lg'>
				<Flex justifyContent='space-between' alignItems='flex-start' gap='4'>
					<VStack alignItems='flex-start' gap='3' flex='1'>
						<Stat.Root>
							<Stat.Label fontSize='sm' color='main.disabled'>
								{i18nData.totalAmount}
							</Stat.Label>
							<Stat.ValueText fontSize={{ base: '3xl', sm: '4xl' }}>
								{`${finalTotal.toFixed(2)} ₴`}
							</Stat.ValueText>
						</Stat.Root>
						{couponDiscount > 0 ? (
							<Text fontSize='sm' color='main.secondary' fontWeight='semibold'>
								{`-${couponDiscount.toFixed(2)} ₴ ${appliedCoupon?.code ?? ''}`}
							</Text>
						) : null}

						<Flex align='center' gap='3' mt='2'>
							<Text fontSize='sm' color='main.disabled'>
								{i18nData.numOfProducts}
							</Text>
							<CountPill value={totalCount} px='2' labelProps={{ fontWeight: 'bold' }} />
						</Flex>
					</VStack>

					<IconButton
						onClick={handleClearCart}
						aria-label='Clear cart'
						variant='subtle'
						rounded='md'
					>
						<Icon size='lg'>
							<FiTrash2 />
						</Icon>
					</IconButton>
				</Flex>

				<Stack mt='4' gap='3'>
					<CouponField subtotal={discountedTotal} layout='responsive' />
				</Stack>

				<Separator my='4' color='border' />

				<LocaleNavButton href='/checkout' onClick={() => setIsOpen(false)} size='md'>
					<FiShoppingCart />
					{i18nData.order}
				</LocaleNavButton>
			</Card.Root>

			<Stack
				direction='column'
				overflowY='auto'
				gap={3}
				maxHeight={{ base: '52vh', md: '60vh' }}
				pr='1'
			>
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
