'use client';

import { VStack, Flex, Separator, RadioGroupValueChangeDetails } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PriceSlider from './PriceSlider';
import { Radio, RadioGroup } from '@/components/reusable/chakra/radio';
import { useRouter, useSearchParams } from 'next/navigation';

export default function QuickFilters({ maxProductPrice }: { maxProductPrice: number }) {
	const t = useTranslations('products');
	const router = useRouter();
	const searchParams = useSearchParams();

	const updateParams = (key: string, value?: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		router.push(`?${params.toString()}`, { scroll: false });
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
		<Flex flexDirection='column' gap='6'>
			<RadioGroup
				value={searchParams.get('orderBy') ?? null}
				onValueChange={handleOrderByChange}
				spaceX='4'
				colorPalette='gray'
				w='100%'
			>
				<VStack gap='4' alignItems='flex-start'>
					<Radio w='100%' value='new' _hover={{ cursor: 'pointer' }}>
						{t('new')}
					</Radio>
					<Radio w='100%' value='expensive' _hover={{ cursor: 'pointer' }}>
						{t('expensiveToCheap')}
					</Radio>
					<Radio w='100%' value='cheap' _hover={{ cursor: 'pointer' }}>
						{t('cheapToExpensive')}
					</Radio>
				</VStack>
			</RadioGroup>

			<Separator color='border.light' w='full' />

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
			>
				<VStack gap='4' alignItems='flex-start'>
					<Radio w='100%' value='all' _hover={{ cursor: 'pointer' }}>
						{t('all')}
					</Radio>
					<Radio w='100%' value='inStock' _hover={{ cursor: 'pointer' }}>
						{t('productIsPresent')}
					</Radio>
					<Radio w='100%' value='outOfStock' _hover={{ cursor: 'pointer' }}>
						{t('productIsOutOfStock')}
					</Radio>
				</VStack>
			</RadioGroup>

			<PriceSlider maxProductPrice={maxProductPrice} title={t('price')} />
		</Flex>
	);
}
