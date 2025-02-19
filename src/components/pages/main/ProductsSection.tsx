import { Heading, Flex, Link, FlexProps } from '@chakra-ui/react';
import ProductsSlider from '../../reusable/slider/ProductsSlider';

interface Props extends FlexProps {
	title: string;
}

export default function ProductsSection({ title, ...restProps }: Props) {
	return (
		<Flex gap={6} direction='column' my={24} {...restProps}>
			<Heading fontWeight='normal'>
				<Link
					fontSize='28px'
					variant='underline'
					textUnderlineOffset='12px'
					transition='all 0.2s ease-in-out'
					textWrap='wrap'
					wordBreak='break-all'
					_hover={{ color: 'main.accent' }}
					_focus={{ outline: 'none' }}
				>
					{title}
				</Link>
			</Heading>
			<ProductsSlider />
		</Flex>
	);
}
