import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { IconButton, Stack, Flex, Icon, Stat, VStack, Highlight, Text } from '@chakra-ui/react';
import CartOrderCard from '@/components/reusable/cards/CartOrderCard';
import { LocaleNavButton } from '../reusable/links/LocaleNavLink';
import { I18nData } from '@/types/i18n';
import { Dispatch, SetStateAction } from 'react';
import { useCart } from '../providers/CartProvider';

interface Props {
	i18nData: I18nData;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CartWithProducts({ i18nData, setIsOpen }: Props) {
	const { cartData, handleClearCart } = useCart();
	const { items: cartItems } = cartData;

	const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
	const totalPrice = cartItems.reduce((acc, item) => {
		const price = item.discountPrice ?? item.basePrice;
		return acc + price * item.quantity;
	}, 0);

	return (
		<>
			<Flex align='center' py={3} justifyContent='space-between'>
				<Flex justifyContent='flex-start' gap={6} direction='column'>
					<VStack gap='4' alignItems='flex-start'>
						<Stat.Root>
							<Stat.Label fontSize='15px'>{i18nData.totalAmount}</Stat.Label>
							<Stat.ValueText fontSize='3xl'>{`${totalPrice.toFixed(2)} ₴`}</Stat.ValueText>
						</Stat.Root>
						<Text fontWeight='normal' fontSize='15px'>
							{`${i18nData.numOfProducts}:  `}
							<Highlight query={`${totalCount}`} styles={{ fontWeight: 'bold', fontSize: 'lg' }}>
								{`${totalCount}`}
							</Highlight>
						</Text>
					</VStack>
					<LocaleNavButton href='/checkout' onClick={() => setIsOpen(false)}>
						<FiShoppingCart />
						{i18nData.order}
					</LocaleNavButton>
				</Flex>
				<IconButton
					onClick={handleClearCart}
					aria-label='Trash'
					variant='ghost'
					rounded='full'
					color='main.disabled'
					transition='all 0.2s ease-in-out'
					_hover={{
						bg: 'colorPalette.500',
						color: 'main.lightOnly',
					}}
				>
					<Icon size='lg'>
						<FiTrash2 />
					</Icon>
				</IconButton>
			</Flex>
			<Stack direction='column' overflowY='auto' gap={4} mt={4} maxHeight='650px'>
				{cartItems.map((item) => (
					<CartOrderCard key={item?.id} product={item} i18nData={i18nData} />
				))}
			</Stack>
		</>
	);
}
