'use client';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { VStack, List, Link, Accordion, Separator, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

type Props = {
	data: {
		categoryName: string;
		categorySlug: string;
		subcategoryName: string;
		subcategorySlug: string;
	}[];
	allCategories: string;
};

export default function SearchCategories({ data, allCategories }: Props) {
	const [showAll, setShowAll] = useState(false);

	const categoryList = useMemo(() => {
		const grouped = data.reduce(
			(acc, item) => {
				const key = item.categorySlug;
				if (!acc[key]) {
					acc[key] = {
						categoryName: item.categoryName,
						categorySlug: item.categorySlug,
						subcategories: [],
					};
				}
				acc[key].subcategories.push({
					subcategoryName: item.subcategoryName,
					subcategorySlug: item.subcategorySlug,
				});
				return acc;
			},
			{} as Record<
				string,
				{
					categoryName: string;
					categorySlug: string;
					subcategories: { subcategoryName: string; subcategorySlug: string }[];
				}
			>
		);

		return Object.values(grouped);
	}, [data]);

	const visibleCategories = useMemo(
		() => (showAll ? categoryList : categoryList.slice(0, 5)),
		[showAll, categoryList]
	);
	const visibleCategorySlugs = useMemo(
		() => new Set(visibleCategories.map((c) => c.categorySlug)),
		[visibleCategories]
	);

	const [openCategories, setOpenCategories] = useState<string[]>(
		() => visibleCategories.map((c) => c.categorySlug)
	);

	useEffect(() => {
		setOpenCategories((prev) => {
			const next = prev.filter((slug) => visibleCategorySlugs.has(slug));
			if (next.length === prev.length && next.every((slug, index) => slug === prev[index])) {
				return prev;
			}
			return next;
		});
	}, [visibleCategorySlugs]);

	return (
		<VStack align='flex-start' pb={4} w='full' gap='4'>
			<Separator color='border' w='full' />

			<Accordion.Root
				multiple
				collapsible
				lazyMount
				value={openCategories}
				onValueChange={(details) =>
					setOpenCategories((details as { value?: string[] }).value ?? [])
				}
			>
				{visibleCategories.map(({ categoryName, categorySlug, subcategories }) => (
					<Accordion.Item key={categorySlug} value={categorySlug} borderBottomColor='border'>
						<Accordion.ItemTrigger cursor='pointer'>
							<Text fontSize='md' color='main'>
								{categoryName}
							</Text>
							<Accordion.ItemIndicator />
						</Accordion.ItemTrigger>

						<Accordion.ItemContent>
							<Accordion.ItemBody pt='0'>
								<List.Root unstyled>
									{subcategories.map(({ subcategoryName, subcategorySlug }) => (
										<List.Item key={subcategorySlug} pl={4} mt='2'>
											<LocaleNavLink
												href={`/products/${categorySlug}/${subcategorySlug}`}
												fontSize='md'
												transition='color 0.25s ease-in-out'
												textWrap='wrap'
												wordBreak='break-word'
												color='main'
												variant='plain'
												_focus={{ outline: 'none' }}
											>
												{subcategoryName}
											</LocaleNavLink>
										</List.Item>
									))}
								</List.Root>
							</Accordion.ItemBody>
						</Accordion.ItemContent>
					</Accordion.Item>
				))}
			</Accordion.Root>

			{categoryList?.length > 5 && (
				<>
					<Link
						as='button'
						type='button'
						aria-expanded={showAll}
						aria-label={showAll ? 'Show fewer categories' : 'Show all categories'}
						mt='2'
						w='full'
						gap='4'
						transition='all .15s ease-in-out'
						variant='underline'
						textDecorationColor='main'
						_hover={{ color: 'link' }}
						_focus={{ outline: 'none' }}
						onClick={() => setShowAll((prev) => !prev)}
					>
						{allCategories}
						{showAll ? <IoIosArrowUp /> : <IoIosArrowDown />}
					</Link>
					<Separator color='border' w='full' />
				</>
			)}
		</VStack>
	);
}
