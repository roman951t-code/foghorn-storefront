import { Heading, Flex, FlexProps } from '@chakra-ui/react';
import ProductsSlider from '@/components/product/slider/ProductsSlider';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';

interface Props extends FlexProps {
	title: string;
	tag: string;
}

export default function ProductsSection({ title, tag, ...restProps }: Props) {
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
			<ProductsSlider tag={tag} />
		</Flex>
	);
}
