'use client';

import { FiSearch } from 'react-icons/fi';
import { Text, Input, Flex, IconButton } from '@chakra-ui/react';
import { Slider } from '@/components/reusable/chakra/slider';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
	title: string;
	maxProductPrice: number;
}

export default function PriceSlider({ title, maxProductPrice }: Props) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const maxPrice = useRef(maxProductPrice);

	const minFromParams = Number(searchParams.get('min')) || 0;
	const maxFromParams = Number(searchParams.get('max')) || maxProductPrice;

	const [values, setValues] = useState([minFromParams, maxFromParams]);

	useEffect(() => {
		setValues([Math.max(0, minFromParams), Math.max(0, maxFromParams)]);
	}, [minFromParams, maxFromParams]);

	const handleSearch = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('min', values[0].toString());
		params.set('max', values[1].toString());
		router.push(`?${params.toString()}`);
	};

	const handleMinChange = (val: string) => {
		let number = Number(val);
		if (isNaN(number) || number < 0) number = 0;
		setValues([Math.min(number, values[1]), values[1]]);
	};

	const handleMaxChange = (val: string) => {
		let number = Number(val);
		if (isNaN(number) || number < 0) number = 0;
		setValues([values[0], Math.min(number, maxPrice.current)]);
	};

	return (
		<>
			<Text>{title} ₴</Text>
			<Flex justifyContent='space-between' alignItems='center' gap='1.5'>
				<Flex gap='1.5'>
					<Input
						fontSize='md'
						h='38px'
						minW='60px'
						value={values[0]}
						onChange={(e) => handleMinChange(e.target.value)}
					/>
					<Input
						fontSize='md'
						h='38px'
						minW='60px'
						value={values[1]}
						onChange={(e) => handleMaxChange(e.target.value)}
					/>
				</Flex>

				<IconButton
					aria-label='Search'
					rounded='md'
					size='md'
					color='main.darkOnly'
					h='40px'
					w='40px'
					alignSelf='flex-end'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					onClick={handleSearch}
				>
					<FiSearch />
				</IconButton>
			</Flex>

			<Slider
				size='sm'
				width='100%'
				min={0}
				max={Math.max(1, maxPrice.current)}
				value={[
					Math.max(0, Math.min(values[0], maxPrice.current)),
					Math.max(0, Math.min(values[1], maxPrice.current)),
				]}
				onValueChange={(e) => {
					const [minVal, maxVal] = e.value;
					if (minVal <= maxVal) setValues([minVal, maxVal]);
				}}
			/>
		</>
	);
}
