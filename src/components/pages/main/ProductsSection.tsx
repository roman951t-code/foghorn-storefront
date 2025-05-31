import { Heading, Flex, Link, FlexProps } from '@chakra-ui/react';
import ProductsSlider from '../../reusable/slider/ProductsSlider';

interface Props extends FlexProps {
	title: string;
}

export default function ProductsSection({ title, ...restProps }: Props) {
	return (
		<Flex gap={6} direction='column' my={20} {...restProps}>
			<Heading fontWeight='normal'>
				<Link
					fontSize='28px'
					variant='underline'
					textDecorationColor='main'
					textUnderlineOffset='12px'
					transition='all 0.15s ease-in-out'
					textWrap='wrap'
					wordBreak='break-all'
					_hover={{ textDecorationColor: 'main.accent', textDecorationThickness: '2px' }}
					_focus={{ outline: 'none' }}
				>
					{title}
				</Link>
			</Heading>
			<ProductsSlider />
		</Flex>
	);
}
