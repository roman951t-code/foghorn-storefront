'use client';

import { FiSearch } from 'react-icons/fi';
import { HStack, Input, Flex, IconButton } from '@chakra-ui/react';
import { Slider } from '@/components/ui/chakra/slider';
import FilterSectionHeading from './FilterSectionHeading';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
	title: string;
	maxProductPrice: number;
}

export default function PriceSlider({ title, maxProductPrice }: Props) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const maxPrice = useRef(Math.ceil(maxProductPrice));

	const minFromParams = Number(searchParams.get('min')) || 0;
	const maxFromParams = Number(searchParams.get('max')) || maxPrice.current;

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
			<FilterSectionHeading>{title} ($)</FilterSectionHeading>
			<Flex justifyContent='space-between' alignItems='center' gap={3} w='100%' minW={0}>
				<HStack gap={2} flex='1' minW={0}>
					<Input
						variant='subtle'
						fontSize={{ base: 'md', md: '15px' }}
						color='main'
						h='40px'
						flex='1'
						minW={0}
						type='number'
						inputMode='numeric'
						aria-label='Minimum price'
						min={0}
						max={values[1]}
						value={values[0]}
						onChange={(e) => handleMinChange(e.target.value)}
						rounded='lg'
						bg='bg.tertiary'
						borderColor='border'
					/>
					<Input
						variant='subtle'
						fontSize={{ base: 'md', md: '15px' }}
						color='main'
						h='40px'
						flex='1'
						minW={0}
						type='number'
						inputMode='numeric'
						aria-label='Maximum price'
						min={values[0]}
						max={maxPrice.current}
						value={values[1]}
						onChange={(e) => handleMaxChange(e.target.value)}
						rounded='lg'
						bg='bg.tertiary'
						borderColor='border'
					/>
				</HStack>

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
				mt={4}
				colorPalette='gray'
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
