import { DataList } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import '@/styles/swiper.css';

type CharacteristicsTabProps = {
	attributes: { name: string; value: string | null; unit?: string | null }[];
};

export default function CharacteristicsTab({ attributes }: CharacteristicsTabProps) {
	return (
		<Flex justifyContent='space-between' gap='4'>
			<DataList.Root
				rounded='lg'
				orientation='horizontal'
				divideY='0.5px'
				divideColor='border'
				w='100%'
				bg='bg.tertiary'
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
				p='4'
			>
				{attributes.map((attr) => (
					<DataList.Item key={attr.name} pt='4' fontSize='14px'>
						<DataList.ItemLabel fontWeight='semibold' color='main' w='164px'>
							{attr.name}
						</DataList.ItemLabel>
						<DataList.ItemValue>
							{attr.value ?? '—'}
							{attr.value && attr.unit ? ` ${attr.unit}` : ''}
						</DataList.ItemValue>
					</DataList.Item>
				))}
			</DataList.Root>
		</Flex>
	);
}
