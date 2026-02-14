import { Heading, Flex, FlexProps } from '@chakra-ui/react';
import ProductsSlider from '@/features/product/slider/ProductsSlider';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { getProductsByTag } from '@/actions/products/getProductsByTag';
import { SubcategoryProduct } from '@/types/product';

interface Props extends FlexProps {
	title: string;
	tag: string;
	products?: SubcategoryProduct[];
	limit?: number;
	locale?: string;
}

export default async function ProductsSection({
	title,
	tag,
	products: providedProducts,
	limit = 10,
	locale,
	...restProps
}: Props) {
	const { products = [] } = providedProducts
		? { products: providedProducts }
		: await getProductsByTag(tag, false, limit, 0, undefined, undefined, undefined, undefined, undefined, locale);

	if (!products.length) return null;

	return (
		<Flex gap={6} direction='column' mt={24} {...restProps}>
			<Heading fontWeight='medium'>
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
			<ProductsSlider products={products} />
		</Flex>
	);
}
