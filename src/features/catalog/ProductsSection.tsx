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
	href?: string;
}

export const DEFAULT_PRODUCTS_SECTION_LIMIT = 10;

export default async function ProductsSection({
	title,
	tag,
	products: providedProducts,
	limit = DEFAULT_PRODUCTS_SECTION_LIMIT,
	locale,
	href,
	...restProps
}: Props) {
	const { products = [] } = providedProducts
		? {
				products: providedProducts.filter((product) => Boolean(product?.inStock)),
			}
		: await getProductsByTag(
				tag,
				false,
				limit,
				0,
				undefined,
				undefined,
				true,
				undefined,
				undefined,
				locale,
			);
	const visibleProducts = products.slice(0, limit);

	if (!visibleProducts.length) return null;

	return (
		<Flex gap={6} direction='column' mt={28} {...restProps}>
			<Heading fontWeight='medium'>
				<LocaleNavLink
					href={href ?? `/products/search/?tag=${tag}`}
					fontSize='24px'
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
			<ProductsSlider products={visibleProducts} />
		</Flex>
	);
}
