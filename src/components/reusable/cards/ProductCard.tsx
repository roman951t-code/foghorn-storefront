import React from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { Rating } from '@/components/ui/rating';
import { useTranslations } from 'next-intl';
import { IconButton, Text, Flex, HStack, Card, Badge, LinkBox } from '@chakra-ui/react';
import ProductPreviewSlider from '../slider/ProductPreviewSlider';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';
import { LocaleNavLink } from '../links/LocaleNavLink';

export default function ProductCard() {
	const t = useTranslations('Products');

	return (
		<Card.Root
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			minWidth='200px'
			w='100%'
			border='1px solid'
			borderColor='border.dark'
			bg='bg.tertiary'
			transition='all 0.25s ease-in-out'
			_hover={{
				borderColor: { base: 'orange', _dark: 'yellow' },
			}}
		>
			<Flex direction='column' gap={2} p={4} pt='2.5'>
				<Flex align='center' justifyContent='space-between'>
					<IconButton
						aria-label='Cart'
						variant='ghost'
						rounded='full'
						colorPalette='green'
						color={{ base: 'colorPalette.600', _dark: 'colorPalette.500' }}
						transition='all 0.2s ease-in-out'
						_hover={{
							bg: 'colorPalette.600',
							color: 'main.lightOnly',
						}}
					>
						<FiShoppingCart />
					</IconButton>
					<IconButton
						aria-label='Favourite'
						variant='ghost'
						rounded='full'
						colorPalette='red'
						color='colorPalette.400'
						transition='all 0.2s ease-in-out'
						_hover={{
							bg: 'colorPalette.400',
							color: 'main.lightOnly',
						}}
					>
						<FiHeart />
					</IconButton>
				</Flex>
				<ProductPreviewSlider />

				<LinkBox>
					<Card.Title fontWeight='medium' fontSize='md' lineHeight='24px' mt='1' w='100%'>
						<LocaleNavLink
							href='/products/1/1'
							textDecorationColor='main'
							color='main'
							variant='underline'
						>
							iPhone 16 Pro Max 256 GB Desert Titanium
						</LocaleNavLink>
					</Card.Title>
					<Text color='main' fontSize='2xl' mt='2'>
						55 699 ₴
					</Text>
					<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
						59 709 ₴
						<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='12px'>
							- 150₴
						</Badge>
					</Text>
				</LinkBox>

				<HStack gap='4' mt='2'>
					<Rating readOnly size='xs' defaultValue={5} />
					<LocaleNavLink href='/cabinet/feedback' variant='underline' fontSize='sm' color='main'>
						{t('feedback')} (3)
					</LocaleNavLink>
				</HStack>
			</Flex>
		</Card.Root>
	);
}
