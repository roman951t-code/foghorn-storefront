import React from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { Rating } from '@/components/ui/rating';
import { useTranslations } from 'next-intl';
import { IconButton, Text, Flex, HStack, Card, Badge, Link, Image } from '@chakra-ui/react';
import ProductPreviewSlider from '../slider/ProductPreviewSlider';

const img1 = '/assets/images/temp/1.webp';

export default function ProductCard({ isSliderEnabled = false }) {
	const t = useTranslations('Products');
	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			border='1px solid'
			borderColor='border.dark'
			bg='bg.tertiary'
			transition='all 0.25s ease-in-out'
			_hover={{
				borderColor: 'main.accent',
			}}
		>
			<Flex direction='column' gap={2} p={4}>
				<Flex align='center' justifyContent='space-between'>
					<IconButton
						aria-label='Cart'
						variant='ghost'
						rounded='full'
						colorPalette='green'
						color='colorPalette.600'
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
				{isSliderEnabled ? (
					<ProductPreviewSlider />
				) : (
					<Image margin='auto' width='140px' height='auto' src={img1} alt='Product photo' />
				)}
				<Card.Title fontWeight='medium' fontSize='md' lineHeight='20px' mt='12px' w='100%'>
					<Link
						href='#'
						color='main'
						variant='underline'
						_focus={{ outline: 'none' }}
						transition='all .15s ease-in-out'
						textDecorationColor='main'
						_hover={{ color: 'link' }}
					>
						iPhone 16 Pro Max 256 GB Desert Titanium
					</Link>
				</Card.Title>
				<Text color='main' fontSize='2xl'>
					55 699 ₴
				</Text>
				<Text color='main.disabled' fontSize='sm' textDecoration='line-through'>
					59 709 ₴{' '}
					<Badge variant='solid' color='main.lightOnly' bg='main.tertiary' marginLeft='12px'>
						- 150₴
					</Badge>
				</Text>
				<HStack gap='4'>
					<Rating colorPalette='orange' readOnly size='xs' defaultValue={5} />
					<Link
						href='#'
						variant='underline'
						fontSize='sm'
						color='main'
						_focus={{ outline: 'none' }}
					>
						{t('feedback')} (3)
					</Link>
				</HStack>
			</Flex>
		</Card.Root>
	);
}
