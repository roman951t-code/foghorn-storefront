'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	ButtonGroup,
	HStack,
	IconButton,
	NumberInput,
	Pagination as ChakraPagination,
	Text,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

type PaginationProps = {
	currentPage: number;
	totalItems: number;
	pageSize: number;
	baseRoute: string;
	pageParam?: string;
	pageSizeParam?: string;
};

export default function Pagination({
	currentPage,
	totalItems,
	pageSize,
	baseRoute,
	pageParam = 'page',
	pageSizeParam = 'perPage',
}: PaginationProps) {
	const t = useTranslations('pagination');
	const router = useRouter();
	const clampPageSize = (val: number) => Math.min(32, Math.max(1, Math.floor(val)));
	const safePageSize = useMemo(() => clampPageSize(pageSize || 1), [pageSize]);
	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(Math.max(totalItems, 0) / safePageSize)),
		[safePageSize, totalItems]
	);
	const safePage = Math.min(Math.max(1, currentPage), totalPages);
	const [inputValue, setInputValue] = useState(safePageSize.toString());

	useEffect(() => {
		setInputValue(safePageSize.toString());
	}, [safePageSize]);

	const resolveBasePath = () => {
		if (typeof window === 'undefined') return baseRoute;

		const currentPath = window.location.pathname;
		if (!baseRoute) return currentPath;
		if (!baseRoute.startsWith('/')) return baseRoute;

		const currentParts = currentPath.split('/').filter(Boolean);
		const maybeLocale = currentParts[0];
		const baseParts = baseRoute.split('/').filter(Boolean);

		if (!maybeLocale) return baseRoute;
		if (baseParts[0] === maybeLocale) return baseRoute;

		return `/${[maybeLocale, ...baseParts].join('/')}`;
	};

	const buildUrl = (page: number, size: number) => {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set(pageParam, page.toString());
		searchParams.set(pageSizeParam, size.toString());
		const basePath = resolveBasePath();
		return `${basePath}?${searchParams.toString()}`;
	};

	const applyPageSize = (value: number) => {
		const normalized = clampPageSize(Number.isFinite(value) ? value : safePageSize);
		router.push(buildUrl(1, normalized));
	};

	const goToPage = (page: number) => {
		const targetPage = Math.min(Math.max(1, page), totalPages);
		router.push(buildUrl(targetPage, safePageSize));
	};

	return (
		<HStack
			justifyContent='space-between'
			alignItems='center'
			flexWrap='wrap'
			gap='6'
			colorPalette='gray'
		>
			<ChakraPagination.Root
				pageSize={safePageSize}
				defaultPage={1}
				count={Math.max(totalItems, 1)}
				page={safePage}
				colorPalette='gray'
				display='flex'
				justifyContent='center'
			>
				<ButtonGroup variant='ghost' size='md'>
					<ChakraPagination.PrevTrigger asChild>
						<IconButton
							disabled={safePage === 1}
							onClick={() => goToPage(safePage - 1)}
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
								variant={safePage === page.value ? 'outline' : 'ghost'}
								borderColor={safePage === page.value ? 'border.dark' : 'transparent'}
								aria-label={`Page ${page.value}`}
							>
								{page.value}
							</IconButton>
						)}
					/>

					<ChakraPagination.NextTrigger asChild>
						<IconButton
							disabled={safePage === totalPages}
							onClick={() => goToPage(safePage + 1)}
							aria-label='Next'
						>
							<LuChevronRight />
						</IconButton>
					</ChakraPagination.NextTrigger>
				</ButtonGroup>
			</ChakraPagination.Root>

			<HStack gap='4' alignItems='center' flexWrap='wrap'>
				<HStack gap='2' alignItems='center'>
					<Text fontSize='sm' color='fg.muted'>
						{t('perPage')}
					</Text>
					<NumberInput.Root
						size='sm'
						min={1}
						max={32}
						value={inputValue}
						onValueChange={(details) => {
							setInputValue(details.value);
							const parsed = Number.parseInt(details.value, 10);
							if (!Number.isNaN(parsed)) {
								applyPageSize(parsed);
							}
						}}
						maxW='70px'
					>
						<NumberInput.Control />
						<NumberInput.Input fontSize='15px' inputMode='numeric' />
					</NumberInput.Root>
				</HStack>
			</HStack>
		</HStack>
	);
}
