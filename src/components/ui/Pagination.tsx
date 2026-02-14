'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
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
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [_, startTransition] = useTransition();
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

	const buildUrl = (page: number, size: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set(pageParam, page.toString());
		params.set(pageSizeParam, size.toString());
		const basePath = baseRoute || pathname;
		return `${basePath}?${params.toString()}`;
	};

	const applyPageSize = (value: number) => {
		const normalized = clampPageSize(Number.isFinite(value) ? value : safePageSize);
		const nextTotalPages = Math.max(
			1,
			Math.ceil(Math.max(totalItems, 0) / Math.max(1, normalized))
		);
		const targetPage = Math.min(safePage, nextTotalPages);
		startTransition(() => {
			router.push(buildUrl(targetPage, normalized), { scroll: false });
		});
	};

	const prevHref = buildUrl(Math.max(1, safePage - 1), safePageSize);
	const nextHref = buildUrl(Math.min(totalPages, safePage + 1), safePageSize);

	return (
		<HStack
			justifyContent='center'
			alignItems='center'
			flexWrap='wrap'
			gap='6'
			colorPalette='gray'
			mt='24'
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
					{safePage === 1 ? (
						<IconButton aria-label='Previous' rounded='md' disabled opacity={0.5}>
							<LuChevronLeft />
						</IconButton>
					) : (
						<Link href={prevHref} prefetch scroll={false}>
							<IconButton as='span' aria-label='Previous' rounded='md'>
								<LuChevronLeft />
							</IconButton>
						</Link>
					)}

					<ChakraPagination.Items
						render={(page) => (
							<Link
								key={page.value}
								href={buildUrl(page.value, safePageSize)}
								prefetch
								scroll={false}
							>
								<IconButton
									as='span'
									variant={safePage === page.value ? 'outline' : 'ghost'}
									borderColor={safePage === page.value ? 'border' : 'transparent'}
									aria-label={`Page ${page.value}`}
									rounded='md'
								>
									{page.value}
								</IconButton>
							</Link>
						)}
					/>

					{safePage === totalPages ? (
						<IconButton aria-label='Next' rounded='md' disabled opacity={0.5}>
							<LuChevronRight />
						</IconButton>
					) : (
						<Link href={nextHref} prefetch scroll={false}>
							<IconButton as='span' aria-label='Next' rounded='md'>
								<LuChevronRight />
							</IconButton>
						</Link>
					)}
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
						aria-label={t('perPage')}
					>
						<NumberInput.Label srOnly>{t('perPage')}</NumberInput.Label>
						<NumberInput.Control />
						<NumberInput.Input
							bg='none'
							fontSize='15px'
							inputMode='numeric'
							aria-label={t('perPage')}
						/>
					</NumberInput.Root>
				</HStack>
			</HStack>
		</HStack>
	);
}
