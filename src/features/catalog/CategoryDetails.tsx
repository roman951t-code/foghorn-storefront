'use client';

import { Box, Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react';
import { BsChevronRight } from 'react-icons/bs';
import { Link } from '@/i18n/routing';
import { LocaleNavLink, LocaleNavButton } from '@/components/ui/links/LocaleNavLink';
import PriorityImageWithFallback from '@/components/ui/PriorityImageWithFallback';
import { CATEGORY_DETAILS_COLUMNS_CSS } from '@/constants/grids';
import type { I18nData } from '@/types/i18n';
import type { CatalogCategory } from '@/types/product';
import { useTranslations } from 'next-intl';
import {
	CATEGORY_PLACEHOLDER_IMAGE,
	resolveCategoryImage,
	resolveSubcategoryImage,
	SUBCATEGORY_PLACEHOLDER_IMAGE,
} from '@/utils/categoryImages';

interface Props {
	i18nData: I18nData;
	category: CatalogCategory | null;
}

export default function CategoryDetails({ category, i18nData }: Props) {
	const productsT = useTranslations('products');
	if (!category) return null;

	const categoryBg = resolveCategoryImage(category.imageUrl);
	const subcategories = category.children ?? [];

	return (
		<Flex
			flex='1'
			minW={0}
			h='516px'
			bg='bg.tertiary'
			overflow='hidden'
			rounded='lg'
			w='100%'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
		>
			<Flex flex='1' minW={0} direction='row' h='full' gap='0.5'>
				<Box
					flex='1'
					minW={0}
					h='full'
					overflowY='auto'
					p='4'
					bgGradient='linear(to-b, rgba(255,255,255,0.04), rgba(255,255,255,0.0))'
				>
					<Box css={CATEGORY_DETAILS_COLUMNS_CSS}>
						{subcategories.map((subcategory) => {
							const subImage = resolveSubcategoryImage(
								subcategory.imageUrl,
								SUBCATEGORY_PLACEHOLDER_IMAGE,
							);
							const subcategoryHref = `/products/${category.slug}/${subcategory.slug}`;
							// `break-inside: avoid` keeps a group's image/title/list together as
							// one unit inside the CSS multi-column layout above, instead of the
							// browser splitting it mid-list across two columns.
							return (
								<Box key={subcategory.id} css={{ breakInside: 'avoid' }} mb='5'>
									<Flex direction='column' align='flex-start' gap='2.5' mb='2'>
										<Link href={subcategoryHref}>
											<Box
												w='140px'
												h='90px'
												flexShrink={0}
												position='relative'
												overflow='hidden'
												rounded='md'
												borderWidth='0.5px'
												borderStyle='solid'
												borderColor='border'
												transition='border-color 0.15s ease-in-out'
												_hover={{ borderColor: 'main.secondary' }}
											>
												<PriorityImageWithFallback
													src={subImage}
													fallbackSrc={SUBCATEGORY_PLACEHOLDER_IMAGE}
													alt={subcategory.name}
													sizes='80px'
													loading='lazy'
													objectFit='fill'
												/>
											</Box>
										</Link>

										<LocaleNavLink
											href={subcategoryHref}
											minW={0}
											display='inline-flex'
											alignItems='center'
											gap='1'
											fontSize='15px'
											fontWeight='bold'
											textDecoration='none'
											color='link'
											_hover={{ transform: 'translateX(2px)', textDecoration: 'underline' }}
										>
											<Text fontSize='md' as='span' lineClamp={1}>
												{subcategory.name}
											</Text>
											<Icon as='span' fontSize='14px' flexShrink={0}>
												<BsChevronRight />
											</Icon>
										</LocaleNavLink>
									</Flex>

									<Stack gap='1.5' align='flex-start'>
										{subcategory.products.length > 0 ? (
											subcategory.products.map((product) => (
												<LocaleNavLink
													key={product.id}
													href={`/products/${product.fullSlug}`}
													w='full'
													fontSize='15px'
													color='main'
													textDecoration='none'
													lineClamp={1}
													_hover={{ color: 'link' }}
													_focusVisible={{
														outline: '2px solid',
														outlineColor: 'main.secondary',
														outlineOffset: '2px',
													}}
												>
													{product.name}
												</LocaleNavLink>
											))
										) : (
											<Text fontSize='15px' color='gray.500'>
												{productsT('productsNotFound')}
											</Text>
										)}

										<LocaleNavLink
											href={subcategoryHref}
											fontSize='15px'
											color='link'
											mt='0.5'
											textDecoration='underline'
											textUnderlineOffset='3px'
											_focusVisible={{
												outline: '2px solid',
												outlineColor: 'main.secondary',
												outlineOffset: '2px',
											}}
										>
											{i18nData.seeAll}
										</LocaleNavLink>
									</Stack>
								</Box>
							);
						})}
					</Box>
				</Box>

				<Flex
					justify='space-between'
					direction='column'
					align='center'
					bgColor='catalog.bgCategory'
					h='calc(100% + 16px)'
					maxW='320px'
					minW={{ base: '240px', xl: '280px' }}
					flexShrink={0}
					// This used to be `position: absolute; right: 0; top: 0; h: full`,
					// which — as an absolutely positioned element — sized and
					// positioned itself against CatalogPanel's outer relative Flex
					// (the nearest positioned ancestor, two levels up) rather than
					// this component's own 516px-tall box: flush against that
					// ancestor's padding *edge* (ignoring its p='2' padding) on top/
					// right, and 16px taller than its real parent so it reached that
					// ancestor's own bottom edge (clipped there by this component's
					// own overflow='hidden', a couple px short of the panel's own
					// un-clipped height). Now that this is a normal flex child, it's
					// sized/positioned against its real parent instead; the negative
					// margins plus the +16px height reproduce those old offsets so the
					// panel lands in the exact same place.
					mt='-2'
					mr='-2'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					borderRadius='lg'
					p={4}
					pb='6'
					hideBelow='lg'
				>
					<Heading
						color='main'
						size='2xl'
						fontWeight='medium'
						borderBottomWidth='0.5px'
						borderBottomStyle='solid'
						borderBottomColor='border'
						pb='1'
						zIndex={1}
					>
						{category.name}
					</Heading>
					<Box
						position='relative'
						w='full'
						aspectRatio='1'
						overflow='hidden'
						rounded='lg'
						borderWidth='0.5px'
						borderStyle='solid'
						maxW='240px'
						ml='-6px'
						borderColor='border'
					>
						<PriorityImageWithFallback
							src={categoryBg}
							fallbackSrc={CATEGORY_PLACEHOLDER_IMAGE}
							alt={category.name}
							sizes='(min-width: 80em) 260px, 240px'
							loading='eager'
							fetchPriority='high'
							objectFit='cover'
						/>
					</Box>

					<LocaleNavButton href={`/products/${category.slug}`} minW='240px' zIndex={1}>
						{i18nData.seeCategory}
						<BsChevronRight />
					</LocaleNavButton>
				</Flex>
			</Flex>
		</Flex>
	);
}
