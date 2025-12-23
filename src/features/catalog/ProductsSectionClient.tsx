'use client';

import { Heading, Flex, type FlexProps } from '@chakra-ui/react';
import ProductsSlider from '@/features/product/slider/ProductsSlider';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { SubcategoryProduct } from '@/types/product';

interface Props extends FlexProps {
	title: string;
	tag?: string;
	products?: SubcategoryProduct[];
	loading?: boolean;
	skeletonLimit?: number;
}

export default function ProductsSectionClient({
	title,
	tag,
	products,
	loading,
	skeletonLimit,
	...restProps
}: Props) {
	return (
		<Flex gap={6} direction='column' mt={24} {...restProps}>
			<Heading fontWeight='normal'>
				<LocaleNavLink
					href={`/products/search/?tag=${tag}`}
					fontSize='28px'
					variant='underline'
					textUnderlineOffset='12px'
					textWrap='wrap'
					wordBreak='break-all'
					_hover={{
						textDecorationColor: { base: 'orange', _dark: 'yellow' },
						textDecorationThickness: '2px',
					}}
				>
					{title}
				</LocaleNavLink>
			</Heading>
			<ProductsSlider products={products} loading={loading} skeletonLimit={skeletonLimit} />
		</Flex>
	);
}
