'use client';

import { useRouter } from 'next/navigation';
import { ButtonGroup, IconButton, Pagination as ChakraPagination } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

type PaginationProps = {
	currentPage: number;
	totalProductsCount: number;
	productsPerPage: number;
	baseRoute: string;
};

export default function Pagination({
	currentPage,
	totalProductsCount,
	productsPerPage,
	baseRoute,
}: PaginationProps) {
	const router = useRouter();
	const totalPages = Math.ceil(totalProductsCount / productsPerPage);
	const goToPage = (page: number) => {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('page', page.toString());
		router.push(`${baseRoute}?${searchParams.toString()}`);
	};

	if (totalProductsCount === 0) {
		return null;
	}

	return (
		<ChakraPagination.Root
			pageSize={productsPerPage}
			defaultPage={1}
			count={totalProductsCount}
			page={currentPage}
			mt='16'
			colorPalette='gray'
			display='flex'
			justifyContent='center'
		>
			<ButtonGroup variant='ghost' size='md'>
				<ChakraPagination.PrevTrigger asChild>
					<IconButton
						disabled={currentPage === 1}
						onClick={() => goToPage(currentPage - 1)}
						aria-label='Previous'
					>
						<LuChevronLeft />
					</IconButton>
				</ChakraPagination.PrevTrigger>

				<ChakraPagination.Items
					render={(page) => (
						<IconButton
							key={page.value}
							onClick={() => goToPage(page.value)}
							variant={currentPage === page.value ? 'outline' : 'ghost'}
							borderColor={currentPage === page.value ? 'border.dark' : 'transparent'}
							aria-label={`Page ${page.value}`}
						>
							{page.value}
						</IconButton>
					)}
				/>

				<ChakraPagination.NextTrigger asChild>
					<IconButton
						disabled={currentPage === totalPages}
						onClick={() => goToPage(currentPage + 1)}
						aria-label='Next'
					>
						<LuChevronRight />
					</IconButton>
				</ChakraPagination.NextTrigger>
			</ButtonGroup>
		</ChakraPagination.Root>
	);
}
