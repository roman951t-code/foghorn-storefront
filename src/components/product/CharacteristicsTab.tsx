import { DataList } from '@chakra-ui/react';
import { Flex, Box } from '@chakra-ui/react';
import ProductCard from '@/components/reusable/cards/ProductCard';
import { Product } from '@/types/product';

import '@/styles/swiper.css';

type CharacteristicsTabProps = {
	product: Product;
	category: string;
	subcategory: string;
	attributes: { name: string; value: string; unit?: string | null }[];
};

export default function CharacteristicsTab({
	attributes,
	product,
	category,
	subcategory,
}: CharacteristicsTabProps) {
	return (
		<Flex justifyContent='space-between' gap='4'>
			<DataList.Root
				rounded='md'
				orientation='horizontal'
				divideY='1px'
				divideColor='border.dark'
				w='100%'
				bg='bg.tertiary'
				border='1px solid'
				borderColor='border.dark'
				p='4'
			>
				{attributes.map((attr) => (
					<DataList.Item key={attr.name} pt='4' fontSize='14px'>
						<DataList.ItemLabel fontWeight='semibold' color='main' w='164px'>
							{attr.name}
						</DataList.ItemLabel>
						<DataList.ItemValue>
							{attr.value}
							{attr.unit ? ` ${attr.unit}` : ''}
						</DataList.ItemValue>
					</DataList.Item>
				))}
			</DataList.Root>
			<Box hideBelow='md' maxW='250px' className='productsSlider'>
				<ProductCard product={product} category={category} subcategory={subcategory} />
			</Box>
		</Flex>
	);
}
