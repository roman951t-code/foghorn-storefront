'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTrackedNavigation } from '@/hooks/useTrackedNavigation';
import LinkPendingReporter from '@/components/ui/nav/LinkPendingReporter';
import {
	ButtonGroup,
	HStack,
	IconButton,
	Pagination as ChakraPagination,
	Text,
	NumberInput,
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
	const { push } = useTrackedNavigation();
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
			push(buildUrl(targetPage, normalized), { scroll: false });
		});
	};

	const prevHref = buildUrl(Math.max(1, safePage - 1), safePageSize);
	const nextHref = buildUrl(Math.min(totalPages, safePage + 1), safePageSize);
	const navButtonStyles = {
		rounded: 'full',
		minW: '40px',
		h: '40px',
		borderWidth: '0.5px',
		borderColor: 'gray',
		bg: 'bg.tertiary',
		color: 'main',
		transition: 'all 0.2s ease',
		_hover: {
			bg: 'bgHover.promoCard',
		},
	} as const;

	return (
		<HStack
			justifyContent='center'
			alignItems='center'
			flexWrap='wrap'
			gap={{ base: '4', md: '6' }}
			mt={{ base: '14', md: '20' }}
			w='full'
		>
			<HStack
				justifyContent='center'
				alignItems='center'
				flexWrap='wrap'
				gap={{ base: '3', md: '5' }}
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
				bg='bg.tertiary'
				rounded='2xl'
				px={{ base: '3', md: '5' }}
				py={{ base: '3', md: '3.5' }}
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
					<ButtonGroup variant='ghost' size='md' gap='1.5'>
						{safePage === 1 ? (
							<IconButton
								aria-label={t('previous')}
								{...navButtonStyles}
								disabled
								opacity={0.45}
								cursor='not-allowed'
								_hover={undefined}
							>
								<LuChevronLeft />
							</IconButton>
						) : (
							<Link href={prevHref} prefetch scroll={false}>
								<LinkPendingReporter />
								<IconButton as='span' aria-label={t('previous')} {...navButtonStyles}>
									<LuChevronLeft />
								</IconButton>
							</Link>
						)}

						<ChakraPagination.Items
							render={(page) => {
								const isActive = safePage === page.value;
								return (
									<Link
										key={page.value}
										href={buildUrl(page.value, safePageSize)}
										prefetch
										scroll={false}
									>
										<LinkPendingReporter />
										<IconButton
											as='span'
											rounded='full'
											minW='40px'
											h='40px'
											fontWeight={isActive ? 'semibold' : 'medium'}
											borderWidth='0.5px'
											borderColor={isActive ? 'main.secondary' : 'border'}
											bg={isActive ? 'main.secondary' : 'bg.tertiary'}
											color={isActive ? 'black' : 'main'}
											aria-label={t('page', { value: page.value })}
											aria-current={isActive ? 'page' : undefined}
											transition='all 0.2s ease'
											_hover={
												isActive
													? undefined
													: {
															bg: 'bgHover.promoCard',
													  }
											}
											_active={isActive ? undefined : { transform: 'translateY(0)' }}
										>
											{page.value}
										</IconButton>
									</Link>
								);
							}}
						/>

						{safePage === totalPages ? (
							<IconButton
								aria-label={t('next')}
								{...navButtonStyles}
								disabled
								opacity={0.45}
								cursor='not-allowed'
								_hover={undefined}
							>
								<LuChevronRight />
							</IconButton>
						) : (
							<Link href={nextHref} prefetch scroll={false}>
								<LinkPendingReporter />
								<IconButton as='span' aria-label={t('next')} {...navButtonStyles}>
									<LuChevronRight />
								</IconButton>
							</Link>
						)}
					</ButtonGroup>
				</ChakraPagination.Root>

				<HStack gap='3.5' alignItems='center' rounded='xl' py='2.5'>
					<Text
						fontSize={{ base: 'md', md: 'sm' }}
						letterSpacing='0.05em'
						textTransform='uppercase'
						color='fg.muted'
						fontWeight='semibold'
					>
						{t('perPage')}
					</Text>
						<NumberInput.Root
							variant='subtle'
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
							maxW='62px'
							aria-label={t('perPage')}
						>
						<NumberInput.Label srOnly>{t('perPage')}</NumberInput.Label>
						<NumberInput.Control fontSize={{ base: 'md', md: 'sm' }} />
						<NumberInput.Input
							rounded='md'
							color='fg'
							bg='none'
							borderColor='gray'
							fontSize={{ base: 'md', md: 'sm' }}
							inputMode='numeric'
							aria-label={t('perPage')}
						/>
					</NumberInput.Root>
				</HStack>
			</HStack>
		</HStack>
	);
}
