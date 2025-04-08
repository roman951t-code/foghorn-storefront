import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import {
	IconButton,
	Image,
	Stack,
	Flex,
	Button,
	Icon,
	Stat,
	Float,
	Circle,
	VStack,
	Separator,
	Highlight,
	Text,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/ui/empty-state';
import CartOrderCard from '../../reusable/cards/CartOrderCard';
import CenteredModal from '../../dialogs/CenteredModal';

const emptyCart = '/assets/images/emptyCart.png';

const CartBtn = () => (
	<IconButton
		aria-label='Cart'
		size='md'
		variant='ghost'
		position='relative'
		color='main.lightOnly'
		rounded='full'
		colorPalette='green'
		bg={{ _hover: 'colorPalette.600' }}
	>
		<Float offset='0.5'>
			<Circle size='4.5' bg='bg.accent' color='black' fontSize='xs' fontWeight='semibold'>
				5
			</Circle>
		</Float>
		<FiShoppingCart />
	</IconButton>
);

export default function Cart() {
	const headT = useTranslations('Header');
	const prodT = useTranslations('Products');

	const isCartEmpty = false;

	return (
		<CenteredModal title={headT('cart')} trigger={<CartBtn />} size={isCartEmpty ? 'md' : 'lg'}>
			{isCartEmpty ? (
				<Stack direction='column'>
					<Image
						src={emptyCart}
						fit='cover'
						alt='empty cart'
						width='200px'
						margin='20px auto 20px 25%'
					/>
					<EmptyState
						paddingBlock='0'
						paddingBottom={8}
						title={headT('emptyCart')}
						description={headT('emptyCartDescr')}
					/>
				</Stack>
			) : (
				<>
					<Flex align='center' py={3} justifyContent='space-between'>
						<Flex justifyContent='flex-start' gap={6} direction='column'>
							<VStack gap='3' alignItems='flex-start'>
								<Stat.Root>
									<Stat.Label fontSize='sm'>{prodT('totalAmount')}</Stat.Label>
									<Stat.ValueText w='124px' fontSize='3xl'>
										55 699 ₴
									</Stat.ValueText>
								</Stat.Root>
								<Text textStyle='sm' fontWeight='normal'>
									<Highlight query='3' styles={{ fontWeight: 'bold' }}>
										{`${prodT('numOfProducts')}: 3`}
									</Highlight>
								</Text>
							</VStack>
							<Button
								bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
								color='black'
								variant='solid'
							>
								{headT('order')}
							</Button>
						</Flex>
						<IconButton
							aria-label='Trash'
							variant='ghost'
							rounded='full'
							colorPalette='gray'
							color='colorPalette.500'
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
						<CartOrderCard />
						<CartOrderCard />
						<CartOrderCard />
					</Stack>
				</>
			)}
		</CenteredModal>
	);
}
