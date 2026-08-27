import { Heading, Flex, FlexProps, Box } from '@chakra-ui/react';
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
	lazyMount?: boolean;
}

export const DEFAULT_PRODUCTS_SECTION_LIMIT = 10;

export default async function ProductsSection({
	title,
	tag,
	products: providedProducts,
	limit = DEFAULT_PRODUCTS_SECTION_LIMIT,
	locale,
	href,
	lazyMount,
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
		<Flex gap={6} direction='column' mt={{ base: 12, md: 28 }} {...restProps}>
			<Heading fontWeight='bold' display='flex' alignItems='center' gap='3'>
				<Box
					w='4px'
					h='28px'
					flexShrink={0}
					rounded='full'
					bg={{ base: 'orange.400', _dark: 'yellow.400' }}
					mt='-1'
				/>
				<LocaleNavLink
					href={href ?? `/products/search/?tag=${tag}`}
					fontSize={{ base: '22px', md: '28px' }}
					fontWeight='semibold'
					letterSpacing='tight'
					variant='plain'
					textWrap='wrap'
					wordBreak='break-all'
					_hover={{
						transform: 'translateX(2px)',
					}}
				>
					{title}
				</LocaleNavLink>
			</Heading>
			<ProductsSlider products={visibleProducts} lazyMount={lazyMount} />
		</Flex>
	);
}
