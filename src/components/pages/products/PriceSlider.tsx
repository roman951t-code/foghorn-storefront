'use client';
import { Slider } from '@/components/ui/slider';
import { FiSearch } from 'react-icons/fi';
import { Text, Input, Flex, IconButton } from '@chakra-ui/react';

interface Props {
	title: string;
}

export default function PriceSlider({ title }: Props) {
	return (
		<>
			<Text>{title} ₴</Text>
			<Flex justifyContent='space-between' gap='3'>
				<Flex gap='3'>
					<Input minW='66px' _focus={{ outline: 'none' }} />
					<Input minW='66px' _focus={{ outline: 'none' }} />
				</Flex>

				<IconButton
					aria-label='Search'
					rounded='md'
					size='md'
					color='main.darkOnly'
					width='44px'
					alignSelf='flex-end'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				>
					<FiSearch />
				</IconButton>
			</Flex>

			<Slider
				size='sm'
				width='100%'
				defaultValue={[0, 90]}
				onValueChange={(e) => console.log('ff', e)}
				// marks={[
				// 	{ value: 0, label: '0 ₴' },
				// 	{ value: 100, label: '100 ₴' },
				// ]}
			/>
		</>
	);
}
