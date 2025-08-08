'use client';
import { LocaleNavLink } from '@/components/reusable/links/LocaleNavLink';
import { VStack, List, Link, Accordion, Separator, Text } from '@chakra-ui/react';
import { useState } from 'react';
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

	const categoryList = Object.values(grouped);
	const visibleCategories = showAll ? categoryList : categoryList.slice(0, 5);

	return (
		<VStack align='flex-start' pb={4} w='full' gap='4'>
			<Separator color='border.light' w='full' />

			<Accordion.Root multiple lazyMount value={visibleCategories.map((c) => c.categorySlug)}>
				{visibleCategories.map(({ categoryName, categorySlug, subcategories }) => (
					<Accordion.Item key={categorySlug} value={categorySlug} borderBottomColor='border.light'>
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

			<Link
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

			<Separator color='border.light' w='full' />
		</VStack>
	);
}
