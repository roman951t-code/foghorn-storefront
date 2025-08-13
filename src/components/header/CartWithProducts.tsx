import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { IconButton, Stack, Flex, Icon, Stat, VStack, Highlight, Text } from '@chakra-ui/react';
import CartOrderCard from '@/components/reusable/cards/CartOrderCard';
import { LocaleNavButton } from '../reusable/links/LocaleNavLink';
import { I18nData } from '@/types/i18n';
import { Dispatch, SetStateAction } from 'react';
import { Product } from '@/types/product';

interface Props {
	i18nData: I18nData;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	cartItems: Product[];
}

export default function CartWithProducts({ i18nData, setIsOpen, cartItems }: Props) {
	return (
		<>
			<Flex align='center' py={3} justifyContent='space-between'>
				<Flex justifyContent='flex-start' gap={6} direction='column'>
					<VStack gap='3' alignItems='flex-start'>
						<Stat.Root>
							<Stat.Label fontSize='sm'>{i18nData.totalAmount}</Stat.Label>
							<Stat.ValueText w='124px' fontSize='3xl'>
								55 699 ₴
							</Stat.ValueText>
						</Stat.Root>
						<Text fontSize='15px' fontWeight='normal'>
							<Highlight query={`${cartItems?.length || 0}`} styles={{ fontWeight: 'bold' }}>
								{`${i18nData.numOfProducts}: ${cartItems?.length || 0}`}
							</Highlight>
						</Text>
					</VStack>
					<LocaleNavButton href='/checkout' onClick={() => setIsOpen(false)}>
						<FiShoppingCart />
						{i18nData.order}
					</LocaleNavButton>
				</Flex>
				<IconButton
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
					<CartOrderCard key={item.id} product={item} />
				))}
			</Stack>
		</>
	);
}
