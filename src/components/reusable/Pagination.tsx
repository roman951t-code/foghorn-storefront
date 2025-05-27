'use client';

import { ButtonGroup, IconButton, Pagination as ChakraPagination } from '@chakra-ui/react';
import { LuChevronRight } from 'react-icons/lu';

export default function Pagination() {
	return (
		<ChakraPagination.Root count={10} pageSize={2} defaultPage={1} my='8' colorPalette='gray'>
			<ButtonGroup variant='ghost' size='md'>
				<ChakraPagination.PrevTrigger asChild>
					<IconButton>
						<LuChevronLeft />
					</IconButton>
				</ChakraPagination.PrevTrigger>

				<ChakraPagination.Items
					render={(page) => (
						<IconButton
							_selected={{ borderColor: 'border.dark' }}
							variant={{ base: 'ghost', _selected: 'outline' }}
						>
							{page.value}
						</IconButton>
					)}
				/>

				<ChakraPagination.NextTrigger asChild>
					<IconButton>
						<LuChevronRight />
					</IconButton>
				</ChakraPagination.NextTrigger>
			</ButtonGroup>
		</ChakraPagination.Root>
	);
}
