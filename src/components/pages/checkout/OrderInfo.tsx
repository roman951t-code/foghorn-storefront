import React from 'react';
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
import { SidebarCheckoutCard, FullCheckoutCard } from '@/components/reusable/cards/CheckoutCard';
import AcceptOrderBtn from './AcceptOrderBtn';

export default function OrderInfo() {
	const t = useTranslations('products');

	return (
		<Flex
			direction='column'
			w='100%'
			gap={2}
			p={4}
			boxShadow='sm'
			bg='bg.tertiary'
			mt='8'
			rounded='sm'
		>
			<Heading as='h3' size='2xl' fontWeight='medium' textAlign='center'>
				{t('yourOrder')}
			</Heading>
			<Separator my='2' color='border.dark' />
			<Box maxH='480px' overflowY='auto' hideBelow='lg'>
				<SidebarCheckoutCard />
				<SidebarCheckoutCard />
			</Box>
			<Box maxH='480px' overflowY='auto' hideFrom='lg'>
				<FullCheckoutCard />
			</Box>
			<VStack alignItems='flex-start' hideBelow='lg'>
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

				<Stat.Root mt='4'>
					<Stat.Label fontSize='sm'>{t('totalAmount')}</Stat.Label>
					<Stat.ValueText w='124px' fontSize='3xl'>
						55 699 ₴
					</Stat.ValueText>
				</Stat.Root>
				<AcceptOrderBtn text={t('acceptOrder')} w='100%' mt='4' maxW='280px' />
			</VStack>

			<Stack
				hideFrom='lg'
				justifyContent='space-between'
				alignItems='flex-start'
				direction={{ base: 'column', sm: 'row' }}
			>
				<VStack alignItems='flex-start' order={{ base: 2, sm: 1 }} gap='6'>
					<Stat.Root mt={{ base: 2, sm: 0 }}>
						<Stat.Label fontSize='sm'>{t('totalAmount')}</Stat.Label>
						<Stat.ValueText w='124px' fontSize='3xl'>
							55 699 ₴
						</Stat.ValueText>
					</Stat.Root>
					<AcceptOrderBtn text={t('acceptOrder')} m={{ base: 'initial', md: 'auto' }} />
				</VStack>
				<VStack
					alignItems={{ base: 'flex-start', sm: 'flex-end' }}
					order={{ base: 1, sm: 2 }}
					gap='3'
				>
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
