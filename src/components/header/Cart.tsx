'use client';

import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import {
	IconButton,
	Stack,
	Flex,
	Icon,
	Stat,
	Float,
	Circle,
	VStack,
	Highlight,
	Text,
} from '@chakra-ui/react';
import { EmptyState } from '@/components/ui/empty-state';
import CartOrderCard from '@/components/reusable/cards/CartOrderCard';
import CenteredModal from '@/components/dialogs/CenteredModal';
import Image from 'next/image';
import { LocaleNavButton } from '../reusable/links/LocaleNavLink';
import { useState } from 'react';
import { I18nData } from '@/types/i18n';

const emptyCart = '/assets/images/emptyCart.png';

const CartBtn = ({ setIsOpen }: { setIsOpen: any }) => (
	<IconButton
		onClick={setIsOpen}
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

interface Props {
	i18nData: I18nData;
}

export default function Cart({ i18nData }: Props) {
	const isCartEmpty = false;

	const [isOpen, setIsOpen] = useState(false);

	return (
		<CenteredModal
			title={i18nData.cart}
			trigger={<CartBtn setIsOpen={setIsOpen} />}
			size={isCartEmpty ? 'md' : 'lg'}
			open={isOpen}
			setIsOpen={setIsOpen}
		>
			{isCartEmpty ? (
				<Stack direction='column'>
					<Image
						src={emptyCart}
						width='240'
						height='240'
						alt='empty cart'
						style={{
							objectFit: 'cover',
							width: '240px',
							height: '240px',
						}}
					/>
					<EmptyState
						paddingBlock='0'
						paddingBottom={8}
						title={i18nData.emptyCart}
						description={i18nData.emptyCartDescr}
					/>
				</Stack>
			) : (
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
								<Text textStyle='sm' fontWeight='normal'>
									<Highlight query='3' styles={{ fontWeight: 'bold' }}>
										{`${i18nData.numOfProducts}: 3`}
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
						<CartOrderCard />
						<CartOrderCard />
						<CartOrderCard />
					</Stack>
				</>
			)}
		</CenteredModal>
	);
}
