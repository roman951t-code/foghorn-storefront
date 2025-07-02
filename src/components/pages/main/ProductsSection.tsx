import { Heading, Flex, FlexProps } from '@chakra-ui/react';
import ProductsSlider from '@/components/reusable/slider/ProductsSlider';
import { LocaleNavLink } from '@/components/reusable/links/LocaleNavLink';

interface Props extends FlexProps {
	title: string;
}

export default function ProductsSection({ title, ...restProps }: Props) {
	return (
		<Flex gap={6} direction='column' my={20} {...restProps}>
			<Heading fontWeight='normal'>
				<LocaleNavLink
					href='/products/123'
					fontSize='28px'
					variant='underline'
					textUnderlineOffset='12px'
					textWrap='wrap'
					wordBreak='break-all'
					_hover={{ textDecorationColor: 'main.accent', textDecorationThickness: '2px' }}
				>
					{title}
				</LocaleNavLink>
			</Heading>
			<ProductsSlider />
		</Flex>
	);
}
