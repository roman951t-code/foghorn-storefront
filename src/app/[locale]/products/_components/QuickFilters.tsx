'use client';

import { Box, Flex, VStack, type RadioGroupValueChangeDetails } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import PriceSlider from './PriceSlider';
import FilterSectionHeading, { FILTER_ACCENT } from './FilterSectionHeading';
import { Radio, RadioGroup } from '@/components/ui/chakra/radio';
import { useSearchParams } from 'next/navigation';
import { useTrackedNavigation } from '@/hooks/useTrackedNavigation';

const radioRowStyle = {
	w: '100%',
	minW: 0,
	whiteSpace: 'normal' as const,
	wordBreak: 'break-word' as const,
	textAlign: 'start' as const,
	color: 'main',
	fontSize: { base: 'md', md: 'sm' },
	px: 3,
	py: 2.5,
	rounded: 'lg',
	borderWidth: '0.5px',
	borderStyle: 'solid' as const,
	borderColor: 'border',
	transition: 'all 0.15s ease-in-out',
	_hover: { cursor: 'pointer' as const, bg: 'bgHover.promoCard' },
	_checked: {
		borderColor: FILTER_ACCENT,
	},
};

const sectionBoxStyle = {
	rounded: 'lg',
	bg: 'bg.tertiary',
	p: 4,
	w: '100%',
	minW: 0,
	borderWidth: '0.5px',
	borderStyle: 'solid' as const,
	borderColor: 'border',
};

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
			<Box {...sectionBoxStyle}>
				<FilterSectionHeading>{t('sortBy')}</FilterSectionHeading>
				<RadioGroup
					value={searchParams.get('orderBy') ?? null}
					onValueChange={handleOrderByChange}
					spaceX='4'
					colorPalette='gray'
					w='100%'
					orientation='vertical'
				>
					<VStack gap={2} alignItems='stretch'>
						<Radio {...radioRowStyle} value='new'>
							{t('new')}
						</Radio>
						<Radio {...radioRowStyle} value='expensive'>
							{t('expensiveToCheap')}
						</Radio>
						<Radio {...radioRowStyle} value='cheap'>
							{t('cheapToExpensive')}
						</Radio>
					</VStack>
				</RadioGroup>
			</Box>

			<Box {...sectionBoxStyle}>
				<FilterSectionHeading>{t('availability')}</FilterSectionHeading>
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
						<Radio {...radioRowStyle} value='all'>
							{t('all')}
						</Radio>
						<Radio {...radioRowStyle} value='inStock'>
							{t('productIsPresent')}
						</Radio>
						<Radio {...radioRowStyle} value='outOfStock'>
							{t('productIsOutOfStock')}
						</Radio>
					</VStack>
				</RadioGroup>
			</Box>

			<Box {...sectionBoxStyle}>
				<PriceSlider maxProductPrice={maxProductPrice} title={t('price')} />
			</Box>
		</Flex>
	);
}
