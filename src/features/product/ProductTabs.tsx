'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/types/product';
import { Tabs } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import type { Review } from '@/types/product';
import { useReviewStore } from '@/stores/reviewStore';
import { isProductTabValue, type ProductTabValue } from '@/constants/products';

const AboutTab = dynamic(() => import('./about/AboutTab'));
const CharacteristicsTab = dynamic(() => import('./CharacteristicsTab'));
const FeedbackTab = dynamic(() => import('./FeedbackTab'));

interface Props {
	category: string;
	subcategory: string;
	tab?: string;
	product: NonNullable<Product>;
}

export default function ProductTabs({ tab = 'about', product, category, subcategory }: Props) {
	const prodT = useTranslations('products');
	const validT = useTranslations('validation');
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	const initialTab: ProductTabValue = tab && isProductTabValue(tab) ? tab : 'about';
	const [selectedTab, setSelectedTab] = useState<ProductTabValue>(initialTab);

	if (!product) {
		return null;
	}

	const storeReviews = useReviewStore((state) => state.reviewsByProduct[product.id]);
	const effectiveReviews = storeReviews ?? (product.reviews as Review[]);
	const reviewCount = effectiveReviews?.length ?? product.reviewCount ?? 0;
	const averageRating =
		reviewCount > 0
			? effectiveReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
			: product.averageRating ?? 0;

	useEffect(() => {
		const urlTab = searchParams?.get('tab') ?? undefined;
		const next: ProductTabValue = urlTab && isProductTabValue(urlTab) ? urlTab : 'about';
		if (next !== selectedTab) {
			setSelectedTab(next);
		}
	}, [searchParams, selectedTab]);

	const items = [
		{
			title: prodT('about'),
			value: 'about' as const,
			content: (
				<AboutTab
					product={product}
					category={category}
					subcategory={subcategory}
					averageRating={averageRating}
					reviewCount={reviewCount}
					onTabChange={(nextTab) => handleTabChange(nextTab)}
				/>
			),
		},
		{
			title: prodT('characteristics'),
			value: 'characteristics' as const,
			content: <CharacteristicsTab product={product} attributes={product.attributes} />,
		},
		{
			title: prodT('feedback'),
			value: 'feedback' as const,
			content: (
				<FeedbackTab
					averageRating={averageRating}
					deleteReviewFail={validT('deleteReviewFail')}
					productId={product.id}
					reviews={product.reviews as Review[]}
				/>
			),
		},
	];

	const handleTabChange = (next: ProductTabValue) => {
		setSelectedTab(next);

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
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			lazyMount
			unmountOnExit
			fitted
		>
			<Tabs.List mb='4'>
				{items.map((item, index) => (
					<Tabs.Trigger key={index} value={item.value} fontSize='md'>
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
