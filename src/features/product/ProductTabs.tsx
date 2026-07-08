'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/types/product';
import { Icon, Tabs } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { FiInfo, FiList, FiMessageSquare } from 'react-icons/fi';
import type { Review } from '@/types/product';
import { useReviewStore } from '@/stores/reviewStore';
import { isProductTabValue, type ProductTabValue } from '@/constants/products';
import AboutTab from './about/AboutTab';
import CharacteristicsTab from './CharacteristicsTab';
import FeedbackTab from './FeedbackTab';

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
	const router = useRouter();
	const searchParams = useSearchParams();

	const urlTab = searchParams?.get('tab') ?? tab;
	const selectedTab: ProductTabValue = urlTab && isProductTabValue(urlTab) ? urlTab : 'about';

	const storeReviews = useReviewStore((state) => state.reviewsByProduct[product.id]);
	const effectiveReviews = storeReviews ?? (product.reviews as Review[]);
	const reviewCount = effectiveReviews?.length ?? product.reviewCount ?? 0;
	const averageRating =
		reviewCount > 0
			? effectiveReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
			: (product.averageRating ?? 0);

	const handleTabChange = (next: ProductTabValue) => {
		const params = new URLSearchParams(searchParams?.toString());
		if (next === 'about') {
			params.delete('tab');
		} else {
			params.set('tab', next);
		}
		const query = params.toString();
		const nextUrl = query ? `${pathname}?${query}` : pathname;
		router.replace(nextUrl, { scroll: false });
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
			variant='outline'
			colorPalette={{ base: 'gray', _dark: 'yellow' }}
			lazyMount
			unmountOnExit
			fitted
		>
			<Tabs.List mb='4'>
				{items.map((item, index) => (
					<Tabs.Trigger
						key={index}
						value={item.value}
						fontSize={{ base: 'lg', md: 'md' }}
						fontWeight='medium'
					>
						<Icon as={item.icon} fontSize={{ base: 'lg', md: 'md' }} />
						{item.title}
					</Tabs.Trigger>
				))}
			</Tabs.List>
			{items.map((item, index) => (
				<Tabs.Content
					key={index}
					value={item.value}
					inset='0'
					_open={{
						animationName: 'fade-in, scale-in',
						animationDuration: '300ms',
					}}
					_closed={{
						animationName: 'fade-out, scale-out',
						animationDuration: '120ms',
					}}
				>
					{item.content}
				</Tabs.Content>
			))}
		</Tabs.Root>
	);
}
