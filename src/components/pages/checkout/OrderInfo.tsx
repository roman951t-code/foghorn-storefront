import React from 'react';
import {
	Heading,
	Button,
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
import { SidebarCheckoutCard, FullCheckoutCard } from '@/components/reusable/cards/CheckoutCard';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';

export default function OrderInfo() {
	const t = useTranslations('Products');

	return (
		<Flex
			direction='column'
			w='100%'
			gap={2}
			p={4}
			border='1px solid'
			borderColor='border.dark'
			bg='bg.tertiary'
		>
			<Heading as='h3' size='2xl' fontWeight='medium' textAlign='center'>
				{t('yourOrder')}
			</Heading>
			<Separator my='2' color='border.dark' />
			<Box maxH='480px' overflowY='auto' hideBelow='md'>
				<SidebarCheckoutCard />
				<SidebarCheckoutCard />
			</Box>
			<Box maxH='480px' overflowY='auto' hideFrom='md'>
				<FullCheckoutCard />
			</Box>
			<VStack alignItems='flex-start' hideBelow='md'>
				<Text>
					<Highlight query='1 шт' styles={{ fontWeight: 'semibold' }}>
						{`${t('productsInCart')}: 1 шт`}
					</Highlight>
				</Text>
				<Text>
					<Highlight query='187 ₴' styles={{ fontWeight: 'semibold' }}>
						{`${t('orderSum')}: 187 ₴`}
					</Highlight>
				</Text>

				<Text>
					<Highlight query='-187 ₴' styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}>
						{`${t('discountSum')}: -187 ₴`}
					</Highlight>
				</Text>

				<Stat.Root my='3'>
					<Stat.Label fontSize='sm'>{t('totalAmount')}</Stat.Label>
					<Stat.ValueText w='124px' fontSize='3xl'>
						55 699 ₴
					</Stat.ValueText>
				</Stat.Root>
				<Button
					w='100%'
					type='submit'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					color='black'
					variant='solid'
					m={{ base: 'initial', md: 'auto' }}
				>
					<IoMdCheckmarkCircleOutline />
					{t('acceptOrder')}
				</Button>
			</VStack>

			<Stack
				hideFrom='md'
				justifyContent='space-between'
				alignItems='flex-start'
				direction={{ base: 'column', sm: 'row' }}
			>
				<VStack alignItems='flex-start' order={{ base: 2, sm: 1 }}>
					<Stat.Root mb='2'>
						<Stat.Label fontSize='sm'>{t('totalAmount')}</Stat.Label>
						<Stat.ValueText w='124px' fontSize='3xl'>
							55 699 ₴
						</Stat.ValueText>
					</Stat.Root>
					<Button
						type='submit'
						bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
						color='black'
						variant='solid'
						m={{ base: 'initial', md: 'auto' }}
					>
						<IoMdCheckmarkCircleOutline />
						{t('acceptOrder')}
					</Button>
				</VStack>
				<VStack alignItems={{ base: 'flex-start', sm: 'flex-end' }} order={{ base: 1, sm: 2 }}>
					<Text>
						<Highlight query='1 шт' styles={{ fontWeight: 'semibold' }}>
							{`${t('productsInCart')}: 1 шт`}
						</Highlight>
					</Text>
					<Text>
						<Highlight query='187 ₴' styles={{ fontWeight: 'semibold' }}>
							{`${t('orderSum')}: 187 ₴`}
						</Highlight>
					</Text>

					<Text>
						<Highlight query='-187 ₴' styles={{ fontWeight: 'semibold', color: 'main.tertiary' }}>
							{`${t('discountSum')}: -187 ₴`}
						</Highlight>
					</Text>
				</VStack>
			</Stack>
		</Flex>
	);
}
