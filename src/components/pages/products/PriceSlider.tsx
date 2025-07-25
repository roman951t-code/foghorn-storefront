'use client';
import { FiSearch } from 'react-icons/fi';
import { Text, Input, Flex, IconButton } from '@chakra-ui/react';
import { Slider } from '@/components/reusable/chakra/slider';

interface Props {
	title: string;
}

export default function PriceSlider({ title }: Props) {
	return (
		<>
			<Text>{title} ₴</Text>
			<Flex justifyContent='space-between' alignItems='center' gap='3'>
				<Flex gap='2'>
					<Input fontSize='md' h='38px' minW='66px' _focus={{ outline: 'none' }} />
					<Input fontSize='md' h='38px' minW='66px' _focus={{ outline: 'none' }} />
				</Flex>

				<IconButton
					aria-label='Search'
					rounded='md'
					size='md'
					color='main.darkOnly'
					h='40px'
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
