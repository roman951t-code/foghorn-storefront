'use client';
import { HStack, Tag, Wrap } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FiltersTags() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const minPrice = searchParams.get('min');
	const maxPrice = searchParams.get('max');

	const isPriceRangeSet = minPrice && maxPrice;

	const clearFilters = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete('min');
		params.delete('max');
		router.push(`?${params.toString()}`);
	};

	return (
		<Wrap gap='4'>
			<HStack>
				{isPriceRangeSet && (
					<Tag.Root
						variant='solid'
						size='lg'
						fontWeight='semibold'
						bg='bg.tertiary'
						color='main'
						transition='all .15s ease-in-out'
						px='4'
						py='1.5'
						border='1px solid'
						boxShadow='none'
						borderColor='border.light'
						_hover={{
							borderColor: { base: 'border.dark', _dark: 'border' },
						}}
					>
						<Tag.Label>
							{minPrice} ₴ – {maxPrice} ₴
						</Tag.Label>
						<Tag.EndElement onClick={clearFilters}>
							<Tag.CloseTrigger cursor='pointer' />
						</Tag.EndElement>
					</Tag.Root>
				)}
			</HStack>
		</Wrap>
	);
}
