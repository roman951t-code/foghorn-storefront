'use client';

import { ButtonGroup, IconButton, Pagination as ChakraPagination } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export default function Pagination() {
	return (
		<ChakraPagination.Root count={20} pageSize={2} defaultPage={1}>
			<ButtonGroup variant='ghost' size='sm'>
				<ChakraPagination.PrevTrigger asChild>
					<IconButton>
						<LuChevronLeft />
					</IconButton>
				</ChakraPagination.PrevTrigger>

				{/* <ChakraPagination.Items
					render={(page) => (
						<IconButton variant={{ base: 'ghost', _selected: 'outline' }}>{page.value}</IconButton>
					)}
				/> */}

				<ChakraPagination.NextTrigger asChild>
					<IconButton>
						<LuChevronRight />
					</IconButton>
				</ChakraPagination.NextTrigger>
			</ButtonGroup>
		</ChakraPagination.Root>
	);
}
