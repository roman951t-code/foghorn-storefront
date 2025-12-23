'use client';
import { HStack, Tag, Wrap } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { FILTER_TAG_EXCLUDED_KEYS } from '@/constants/products';

export default function FiltersTags() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const t = useTranslations('products');

	const minPrice = searchParams.get('min');
	const maxPrice = searchParams.get('max');
	const inStockFilter = searchParams.get('inStock');
	const orderByFilter = searchParams.get('orderBy');

	const isPriceRangeSet = minPrice && maxPrice;

	const clearParam = (key: string, value?: string) => {
		const params = new URLSearchParams(searchParams.toString());

		if (value) {
			const values = params.getAll(key).filter((v) => v !== value);
			params.delete(key);
			values.forEach((v) => params.append(key, v));
		} else {
			params.delete(key);
		}

		router.push(`?${params.toString()}`);
	};

	let orderBy = t('new');
	if (orderByFilter === 'expensive') orderBy = t('expensiveToCheap');
	if (orderByFilter === 'cheap') orderBy = t('cheapToExpensive');

	const dynamicFilters: { key: string; value: string }[] = [];
	searchParams.forEach((value, key) => {
		if (!FILTER_TAG_EXCLUDED_KEYS.includes(key)) {
			dynamicFilters.push({ key, value });
		}
	});

	const clearFilters = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete('min');
		params.delete('max');
		router.push(`?${params.toString()}`);
	};

	return (
		<Wrap gap='4'>
			<HStack wrap='wrap'>
				{isPriceRangeSet && (
					<Tag.Root
						variant='solid'
						size='lg'
						fontWeight='medium'
						bg='bg.tertiary'
						color='main'
						transition='all .15s ease-in-out'
						px='4'
						py='1.5'
						border='1px solid'
						borderColor='border.light'
					>
						<Tag.Label>
							{minPrice} ₴ – {maxPrice} ₴
						</Tag.Label>
						<Tag.EndElement onClick={clearFilters}>
							<Tag.CloseTrigger cursor='pointer' aria-label={t('clearFilters')} />
						</Tag.EndElement>
					</Tag.Root>
				)}

				{inStockFilter && (
					<Tag.Root
						variant='solid'
						size='lg'
						fontWeight='medium'
						bg='bg.tertiary'
						color='main'
						transition='all .15s ease-in-out'
						px='4'
						py='1.5'
						border='1px solid'
						borderColor='border.light'
					>
						<Tag.Label>
							{inStockFilter === 'true' ? t('productIsPresent') : t('productIsOutOfStock')}
						</Tag.Label>
						<Tag.EndElement onClick={() => clearParam('inStock')}>
							<Tag.CloseTrigger
								cursor='pointer'
								aria-label={t('clearFilters') + ' ' + t('inStock')}
							/>
						</Tag.EndElement>
					</Tag.Root>
				)}

				{orderByFilter && (
					<Tag.Root
						variant='solid'
						size='lg'
						fontWeight='medium'
						bg='bg.tertiary'
						color='main'
						transition='all .15s ease-in-out'
						px='4'
						py='1.5'
						border='1px solid'
						borderColor='border.light'
					>
						<Tag.Label>{orderBy}</Tag.Label>
						<Tag.EndElement onClick={() => clearParam('orderBy')}>
							<Tag.CloseTrigger cursor='pointer' aria-label={t('clearFilters')} />
						</Tag.EndElement>
					</Tag.Root>
				)}

				{dynamicFilters.map(({ key, value }) => (
					<Tag.Root
						key={`${key}-${value}`}
						variant='solid'
						size='lg'
						fontWeight='medium'
						bg='bg.tertiary'
						color='main'
						transition='all .15s ease-in-out'
						px='4'
						py='1.5'
						border='1px solid'
						borderColor='border.light'
					>
						<Tag.Label>
							{key}: {value}
						</Tag.Label>
						<Tag.EndElement onClick={() => clearParam(key, value)}>
							<Tag.CloseTrigger
								cursor='pointer'
								aria-label={`${t('clearFilters')} ${key}: ${value}`}
							/>
						</Tag.EndElement>
					</Tag.Root>
				))}
			</HStack>
		</Wrap>
	);
}
