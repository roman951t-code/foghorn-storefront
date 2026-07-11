'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Product } from '@/types/product';
import { Box, Icon, Tabs } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { FiInfo, FiList, FiMessageSquare } from 'react-icons/fi';
import type { Review } from '@/types/product';
import { useReviewStore } from '@/stores/reviewStore';
import { isProductTabValue, type ProductTabValue } from '@/constants/products';
import { LoadingSkeleton } from '@/components/ui/Skeleton';

function TabLoadingFallback() {
	return (
		<Box mt='4'>
			<LoadingSkeleton />
		</Box>
	);
}

// ssr stays on (the next/dynamic default) rather than ssr:false like most
// other lazy-loaded pieces in this codebase, because AboutTab carries the
// page's primary SEO content and a direct ?tab=feedback deep link (see
// AboutTab's share-link) needs FeedbackTab's reviews to be crawlable too.
const AboutTab = dynamic(() => import('./about/AboutTab'), {
	loading: () => <TabLoadingFallback />,
});
const CharacteristicsTab = dynamic(() => import('./CharacteristicsTab'), {
	loading: () => <TabLoadingFallback />,
});
const FeedbackTab = dynamic(() => import('./FeedbackTab'), {
	loading: () => <TabLoadingFallback />,
});

interface Props {
	category: string;
	subcategory: string;
	tab?: string;
	product: NonNullable<Product>;
	initialImageIndex?: number;
}

export default function ProductTabs({
	tab = 'about',
	product,
	category,
	subcategory,
	initialImageIndex = 0,
}: Props) {
	const prodT = useTranslations('products');
	const validT = useTranslations('validation');
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Seeds the initial tab from the URL (deep link) on first render only —
	// after that, tab switches are local state; see handleTabChange below for
	// why this isn't re-derived from searchParams on every render.
	const [selectedTab, setSelectedTab] = useState<ProductTabValue>(() => {
		const urlTab = searchParams?.get('tab') ?? tab;
		return urlTab && isProductTabValue(urlTab) ? urlTab : 'about';
	});

	const storeReviews = useReviewStore((state) => state.reviewsByProduct[product.id]);
	const effectiveReviews = storeReviews ?? (product.reviews as Review[]);
	const reviewCount = effectiveReviews?.length ?? product.reviewCount ?? 0;
	const averageRating =
		reviewCount > 0
			? effectiveReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
			: (product.averageRating ?? 0);

	const handleTabChange = (next: ProductTabValue) => {
		setSelectedTab(next);

		// All three panels' data (product/attributes/reviews) is already fully
		// available client-side, so switching tabs doesn't need the server at
		// all. Update the URL directly via the History API — instead of
		// router.replace(), which forces Next to re-render this route's Server
		// Component on every switch (that Page reads searchParams itself) —
		// purely so the tab stays reflected in the URL for deep-linking/refresh,
		// without triggering a fetch.
		const params = new URLSearchParams(searchParams?.toString());
		if (next === 'about') {
			params.delete('tab');
		} else {
			params.set('tab', next);
		}
		const query = params.toString();
		const nextUrl = query ? `${pathname}?${query}` : pathname;
		window.history.replaceState(null, '', nextUrl);
	};

	const aboutContent =
		selectedTab === 'about' ? (
			<AboutTab
				product={product}
				category={category}
				subcategory={subcategory}
				averageRating={averageRating}
				reviewCount={reviewCount}
				initialImageIndex={initialImageIndex}
				onTabChange={(nextTab) => handleTabChange(nextTab)}
			/>
		) : null;
	const characteristicsContent =
		selectedTab === 'characteristics' ? (
			<CharacteristicsTab attributes={product.attributes} />
		) : null;
	const feedbackContent =
		selectedTab === 'feedback' ? (
			<FeedbackTab
				deleteReviewFail={validT('deleteReviewFail')}
				productId={product.id}
				reviews={product.reviews as Review[]}
			/>
		) : null;

	const items = [
		{
			title: prodT('about'),
			value: 'about' as const,
			content: aboutContent,
			icon: FiInfo,
		},
		{
			title: prodT('characteristics'),
			value: 'characteristics' as const,
			content: characteristicsContent,
			icon: FiList,
		},
		{
			title: prodT('feedback'),
			value: 'feedback' as const,
			content: feedbackContent,
			icon: FiMessageSquare,
		},
	];

	return (
		<Tabs.Root
			mt='8'
			value={selectedTab}
			onValueChange={(details) => {
				const next = details.value;
				if (isProductTabValue(next)) {
					handleTabChange(next);
				}
			}}
			width='full'
			variant='line'
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			// lazyMount only (no unmountOnExit): each panel still mounts on first
			// visit, but switching away no longer tears it down — returning to
			// "about" no longer re-initializes ProductThumbsSlider's Swiper
			// instances from scratch every time.
			lazyMount
		>
			<Tabs.List mb='4' flexWrap='wrap' justifyContent='space-around'>
				{items.map((item, index) => (
					<Tabs.Trigger
						key={index}
						value={item.value}
						fontSize='17px'
						opacity='.85'
						color='main'
						_hover={{ opacity: 1, transition: '0.3s ease all' }}
					>
						<Icon as={item.icon} fontSize='md' />
						{item.title}
					</Tabs.Trigger>
				))}
			</Tabs.List>
			{items.map((item, index) => (
				<Tabs.Content key={index} value={item.value} inset='0'>
					{item.content}
				</Tabs.Content>
			))}
		</Tabs.Root>
	);
}
