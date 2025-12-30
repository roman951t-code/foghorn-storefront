import { DataList } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import '@/styles/swiper.css';

type CharacteristicsTabProps = {
	attributes: { name: string; value: string; unit?: string | null }[];
};

export default function CharacteristicsTab({ attributes }: CharacteristicsTabProps) {
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
		</Flex>
	);
}
