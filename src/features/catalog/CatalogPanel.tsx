'use client';

import { useState, useRef } from 'react';
import { Box, Flex, Text, VStack, HStack, Icon, Skeleton } from '@chakra-ui/react';
import { BsChevronRight } from 'react-icons/bs';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import CategoryDetails from './CategoryDetails';
import Promo from './Promo';
import type { I18nData } from '@/types/i18n';
import { useCatalog } from '@/providers/CatalogProvider';
import type { CatalogCategory } from '@/types/product';
import type { PromoCard } from '@/data/navigation/promoCards';

interface Props {
	i18nData: I18nData;
	promoCards?: PromoCard[];
}

export default function CatalogPanel({ i18nData, promoCards }: Props) {
	const { categories } = useCatalog();
	const TARGET_CATEGORIES = 8;
	const panelCategories = categories.slice(0, TARGET_CATEGORIES);
	const uiCategories = Array.from(
		{ length: TARGET_CATEGORIES },
		(_, index) => panelCategories[index] ?? null
	);

	const [activeCategory, setActiveCategory] = useState<CatalogCategory | null>(null);
	const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
	const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

	const handleMouseEnter = (category: CatalogCategory) => {
		setHoveredCategoryId(category.id);
		if (hoverTimeout.current) {
			clearTimeout(hoverTimeout.current);
		}
		hoverTimeout.current = setTimeout(() => {
			setActiveCategory(category);
		}, 160);
	};

	const handleMouseLeave = () => {
		setHoveredCategoryId(null);
		if (hoverTimeout.current) {
			clearTimeout(hoverTimeout.current);
			hoverTimeout.current = null;
		}
		setActiveCategory(null);
	};

	return (
		<Flex
			position='relative'
			rounded='lg'
			gap={3}
			onMouseLeave={handleMouseLeave}
			minH='472px'
			bg='bg.tertiary'
			p={2}
		>
			<VStack
				minW='280px'
				w='280px'
				h='472px'
				align='stretch'
				gap={1}
				rounded='lg'
				hideBelow='md'
				overflow='hidden'
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor={{ base: 'border', _dark: 'border' }}
				bg='bg.tertiary'
			>
				<Box position='sticky' top={0} zIndex={1} bg='bg.tertiary' p={2}>
					<CatalogBtn fullText />
				</Box>

				<VStack align='stretch' gap={1} overflowY='auto' pb={2} px={2} flex='1' minH={0}>
					{uiCategories.map((category, index) => {
						if (!category) {
							return (
								<HStack
									key={`category-skeleton-${index}`}
									align='center'
									justify='space-between'
									px={3}
									py={2.5}
									h='52px'
									rounded='lg'
									bg={index % 2 === 0 ? 'catalog.bgEven' : 'catalog.bgOdd'}
								>
									<Skeleton height='18px' width='70%' borderRadius='lg' />
									<Skeleton height='18px' width='18px' borderRadius='full' />
								</HStack>
							);
						}

						const isHighlighted =
							hoveredCategoryId === category.id || activeCategory?.id === category.id;

						return (
							<HStack
								key={category.id}
								justify='space-between'
								align='center'
								px={3}
								py={2.5}
								h='52px'
								rounded='lg'
								bg={
									isHighlighted
										? 'bgHover.promoCard'
										: index % 2 === 0
										? 'catalog.bgEven'
										: 'catalog.bgOdd'
								}
								borderWidth='0.5px'
								borderStyle='solid'
								borderColor={isHighlighted ? 'border' : 'transparent'}
								transition='all 0.15s ease-in-out'
								_hover={{
									cursor: 'pointer',
									bg: 'bgHover.promoCard',
									transform: 'translateX(2px)',
								}}
								onMouseEnter={() => handleMouseEnter(category)}
							>
								<HStack gap={3} minW={0}>
									<Box
										w='3px'
										h='20px'
										rounded='lg'
										bg={isHighlighted ? 'main.secondary' : 'transparent'}
										transition='background 0.18s ease-in-out'
									/>
									<Text
										fontSize='md'
										fontWeight={isHighlighted ? 'semibold' : 'normal'}
										lineClamp={1}
									>
										{category.name}
									</Text>
								</HStack>

								<Icon
									fontSize='18px'
									color={isHighlighted ? 'main' : 'gray.500'}
									transition='transform 0.15s ease-in-out'
									transform={isHighlighted ? 'translateX(2px)' : 'none'}
								>
									<BsChevronRight />
								</Icon>
							</HStack>
						);
					})}
				</VStack>
			</VStack>

			{!activeCategory && <Promo promos={promoCards} />}
			{activeCategory && (
				<CategoryDetails key={activeCategory.id} category={activeCategory} i18nData={i18nData} />
			)}
		</Flex>
	);
}
