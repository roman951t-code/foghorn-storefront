'use client';

import { Box, Flex, Text, VStack, type RadioGroupValueChangeDetails } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PriceSlider from './PriceSlider';
import { Radio, RadioGroup } from '@/components/ui/chakra/radio';
import { useSearchParams } from 'next/navigation';
import { useTrackedNavigation } from '@/hooks/useTrackedNavigation';

export default function QuickFilters({ maxProductPrice }: { maxProductPrice: number }) {
	const t = useTranslations('products');
	const { push } = useTrackedNavigation();
	const searchParams = useSearchParams();

	const updateParams = (key: string, value?: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		push(`?${params.toString()}`, { scroll: false });
	};

	const handleOrderByChange = (e: RadioGroupValueChangeDetails) => {
		const value = e.value;
		if (value === 'new') updateParams('orderBy', 'new');
		else if (value === 'expensive') updateParams('orderBy', 'expensive');
		else if (value === 'cheap') updateParams('orderBy', 'cheap');
		else updateParams('orderBy', undefined);
	};

	const handleStockChange = (e: RadioGroupValueChangeDetails) => {
		const value = e.value;
		if (value === 'inStock') updateParams('inStock', 'true');
		else if (value === 'outOfStock') updateParams('inStock', 'false');
		else updateParams('inStock', undefined);
	};

	return (
		<Flex flexDirection='column' gap={4} w='100%' minW={0}>
			<Box
				rounded='lg'
				bg='bg.tertiary'
				p={4}
				w='100%'
				minW={0}
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
			>
				<Text fontSize={{ base: 'md', md: 'sm' }} fontWeight='semibold' color='main' mb={3}>
					{t('sortBy')}
				</Text>
				<RadioGroup
					value={searchParams.get('orderBy') ?? null}
					onValueChange={handleOrderByChange}
					spaceX='4'
					colorPalette='gray'
					w='100%'
					orientation='vertical'
				>
					<VStack gap={2} alignItems='stretch'>
						<Radio
							w='100%'
							minW={0}
							whiteSpace='normal'
							wordBreak='break-word'
							textAlign='start'
							color='main'
							fontSize={{ base: 'md', md: 'sm' }}
							value='new'
							px={3}
							py={2.5}
							rounded='lg'
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							transition='all 0.15s ease-in-out'
							_hover={{ cursor: 'pointer', bg: 'bgHover.promoCard' }}
						>
							{t('new')}
						</Radio>
						<Radio
							w='100%'
							minW={0}
							whiteSpace='normal'
							wordBreak='break-word'
							textAlign='start'
							color='main'
							fontSize={{ base: 'md', md: 'sm' }}
							value='expensive'
							px={3}
							py={2.5}
							rounded='lg'
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							transition='all 0.15s ease-in-out'
							_hover={{ cursor: 'pointer', bg: 'bgHover.promoCard' }}
						>
							{t('expensiveToCheap')}
						</Radio>
						<Radio
							w='100%'
							minW={0}
							whiteSpace='normal'
							wordBreak='break-word'
							textAlign='start'
							color='main'
							fontSize={{ base: 'md', md: 'sm' }}
							value='cheap'
							px={3}
							py={2.5}
							rounded='lg'
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							transition='all 0.15s ease-in-out'
							_hover={{ cursor: 'pointer', bg: 'bgHover.promoCard' }}
						>
							{t('cheapToExpensive')}
						</Radio>
					</VStack>
				</RadioGroup>
			</Box>

			<Box
				rounded='lg'
				bg='bg.tertiary'
				p={4}
				w='100%'
				minW={0}
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
			>
				<Text fontSize={{ base: 'md', md: 'sm' }} fontWeight='semibold' color='main' mb={3}>
					{t('availability')}
				</Text>
				<RadioGroup
					value={
						searchParams.get('inStock') === 'true'
							? 'inStock'
							: searchParams.get('inStock') === 'false'
								? 'outOfStock'
								: 'all'
					}
					onValueChange={handleStockChange}
					spaceX='4'
					colorPalette='gray'
					w='100%'
					orientation='vertical'
				>
					<VStack gap={2} alignItems='stretch'>
						<Radio
							w='100%'
							minW={0}
							whiteSpace='normal'
							wordBreak='break-word'
							textAlign='start'
							color='main'
							fontSize={{ base: 'md', md: 'sm' }}
							value='all'
							px={3}
							py={2.5}
							rounded='lg'
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							transition='all 0.15s ease-in-out'
							_hover={{ cursor: 'pointer', bg: 'bgHover.promoCard' }}
						>
							{t('all')}
						</Radio>
						<Radio
							w='100%'
							minW={0}
							whiteSpace='normal'
							wordBreak='break-word'
							textAlign='start'
							color='main'
							fontSize={{ base: 'md', md: 'sm' }}
							value='inStock'
							px={3}
							py={2.5}
							rounded='lg'
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							transition='all 0.15s ease-in-out'
							_hover={{ cursor: 'pointer', bg: 'bgHover.promoCard' }}
						>
							{t('productIsPresent')}
						</Radio>
						<Radio
							w='100%'
							minW={0}
							whiteSpace='normal'
							wordBreak='break-word'
							textAlign='start'
							color='main'
							fontSize={{ base: 'md', md: 'sm' }}
							value='outOfStock'
							px={3}
							py={2.5}
							rounded='lg'
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							transition='all 0.15s ease-in-out'
							_hover={{ cursor: 'pointer', bg: 'bgHover.promoCard' }}
						>
							{t('productIsOutOfStock')}
						</Radio>
					</VStack>
				</RadioGroup>
			</Box>

			<Box
				rounded='lg'
				bg='bg.tertiary'
				p={4}
				w='100%'
				minW={0}
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
			>
				<PriceSlider maxProductPrice={maxProductPrice} title={t('price')} />
			</Box>
		</Flex>
	);
}
