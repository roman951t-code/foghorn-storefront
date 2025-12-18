import { Heading, Flex, FlexProps } from '@chakra-ui/react';
import ProductsSlider from '@/features/product/slider/ProductsSlider';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { SubcategoryProduct } from '@/types/product';

interface Props extends FlexProps {
	title: string;
	tag?: string;
	products?: SubcategoryProduct[];
}

export default function ProductsSection({ title, tag, products, ...restProps }: Props) {
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
			<ProductsSlider tag={tag} products={products} />
		</Flex>
	);
}
