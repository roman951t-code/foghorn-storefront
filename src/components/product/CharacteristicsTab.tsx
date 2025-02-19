import { DataList } from '@chakra-ui/react';
import { Flex, Box } from '@chakra-ui/react';
import ProductCard from '../reusable/cards/ProductCard';

export default function CharacteristicsTab() {
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
				{items.map((item) => (
					<DataList.Item key={item.label} pt='4' fontSize='14px'>
						<DataList.ItemLabel fontWeight='semibold' color='main' w='164px'>
							{item.label}
						</DataList.ItemLabel>
						<DataList.ItemValue>{item.value}</DataList.ItemValue>
					</DataList.Item>
				))}
			</DataList.Root>
			<Box hideBelow='md'>
				<ProductCard />
			</Box>
		</Flex>
	);
}

const items = [
	{
		label: 'Бренд',
		value: `Lightning`,
	},
	{ label: 'Призначення', value: 'Динамічні' },
	{
		label: 'Довжина кабеля',
		value: `Менше 1.5 м`,
	},
	{
		label: 'Комплектація',
		value: `Силіконові насадки, Навушники`,
	},
	{
		label: 'Колір',
		value: `Темно синій`,
	},
	{
		label: 'Довжина в ширину',
		value: `Не менше 15 м`,
	},
	{ label: 'Тип покриття', value: 'Мармур' },
	{
		label: 'Вбудований вай фай',
		value: `Врядлі`,
	},
];
