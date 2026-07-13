'use client';
import { useState } from 'react';
import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/chakra/accordion';
import { useTranslations } from 'next-intl';
import {
	Box,
	VStack,
	Heading,
	Flex,
	Stack,
	HStack,
	Text,
	SimpleGrid,
	Skeleton,
	Icon,
	Wrap,
} from '@chakra-ui/react';
import { DrawerActionTrigger } from '@/components/ui/chakra/drawer';
import { LocaleNavLink, LocaleNavSecButton } from '@/components/ui/links/LocaleNavLink';
import { Link } from '@/i18n/routing';
import { useCatalog } from '@/providers/CatalogProvider';
import { BsChevronRight } from 'react-icons/bs';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import CountPill from '@/components/ui/CountPill';
import PriorityImageWithFallback from '@/components/ui/PriorityImageWithFallback';
import {
	CATEGORY_PLACEHOLDER_IMAGE,
	SUBCATEGORY_PLACEHOLDER_IMAGE,
	resolveCategoryImage,
	resolveSubcategoryImage,
} from '@/utils/categoryImages';

// Fixed px, not a percentage: the image sits inside a Link whose only content
// is next/image's absolutely-positioned `fill` <img>, which contributes no
// intrinsic size. A percentage width can't resolve on a flex item sized by
// shrink-to-fit (any align other than 'stretch'), so it collapses to ~0 —
// matching this to the item's own flex-basis below still reads as "fills the
// item" while staying a length the shrink-to-fit algorithm can use.
const MOBILE_SUBCATEGORY_ITEM_WIDTH_PX = 200;

export default function CatalogDrawer() {
	const t = useTranslations('common');
	const productsT = useTranslations('products');
	const { categories } = useCatalog();
	const categoriesWithChildren = categories.filter(
		(category) => (category.children?.length ?? 0) > 0,
	);

	const [openValues, setOpenValues] = useState<string[]>([]);

	if (!categories || categories.length === 0) {
		return (
			<Box
				w='full'
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
				rounded='lg'
				overflow='hidden'
				bg='bg.tertiary'
			>
				<Box p={4} borderBottomWidth='0.5px' borderBottomStyle='solid' borderColor='border'>
					<Skeleton height='28px' width='220px' borderRadius='lg' />
				</Box>
				<VStack align='stretch' gap={2} p={4}>
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} height='52px' borderRadius='lg' />
					))}
				</VStack>
			</Box>
		);
	}

	return (
		<Box
			w='full'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			rounded='lg'
			overflow='hidden'
			bg='bg.tertiary'
		>
			<Box
				p={{ base: 4, md: 6 }}
				borderBottomWidth='0.5px'
				borderBottomStyle='solid'
				borderColor='border'
				bgGradient='linear(to-r, rgba(255,255,255,0.04), rgba(255,255,255,0.0))'
			>
				<HStack justify='space-between' align='center' gap={3}>
					<Heading fontWeight='semibold' textStyle='2xl' color='main'>
						{t('catalogFull')}
					</Heading>
					<SecondaryButton
						onClick={() => {
							setOpenValues([]);
						}}
					>
						{t('collapseAll')}
					</SecondaryButton>
				</HStack>
			</Box>

			<AccordionRoot
				multiple
				w='full'
				value={openValues}
				onValueChange={(details) => {
					setOpenValues((details as { value?: string[] }).value ?? []);
				}}
				borderBottom='none'
			>
				{categoriesWithChildren.map((category, categoryIndex) => {
					const categoryImage = resolveCategoryImage(category.imageUrl);
					const subCount = category.children?.length ?? 0;
					const subPreview = (category.children ?? [])
						.slice(0, 3)
						.map((c) => c.name)
						.filter(Boolean)
						.join(' • ');

					return (
						<AccordionItem
							key={category.id}
							value={category.slug}
							borderTopWidth={categoryIndex === 0 ? '0px' : '0.5px'}
							borderTopStyle='solid'
							borderTopColor='border'
							borderBottom='none'
						>
							<AccordionItemTrigger
								cursor='pointer'
								p='3.5'
								bg='bg.tertiary'
								transition='all 0.18s ease-in-out'
								_hover={{ bg: 'bgHover.promoCard' }}
							>
								<Box w='full' minW={0}>
									<VStack display={{ base: 'flex', sm: 'none' }} align='center' gap='3' w='full'>
										<Box
											boxSize='100px'
											rounded='lg'
											position='relative'
											overflow='hidden'
											bgColor='bg.tertiary'
											borderWidth='0.5px'
											borderStyle='solid'
											borderColor='border'
											flexShrink={0}
										>
											<PriorityImageWithFallback
												src={categoryImage}
												fallbackSrc={CATEGORY_PLACEHOLDER_IMAGE}
												alt={category.name}
												sizes='100px'
												loading='eager'
												fetchPriority='high'
												objectFit='contain'
											/>
										</Box>

										<VStack align='center' gap='2.5' w='full'>
											<HStack justify='center' align='center' gap='4' w='full'>
												<Text
													fontSize='xl'
													fontWeight='semibold'
													wordBreak='break-word'
													textAlign='center'
												>
													{category.name}
												</Text>
												<CountPill value={subCount} px='2' py='1' labelProps={{ fontSize: 'md' }} />
											</HStack>
											<Text
												fontSize='md'
												opacity={0.75}
												wordBreak='break-word'
												textAlign='center'
												title={subPreview}
											>
												{subPreview}
											</Text>
										</VStack>
									</VStack>

									<HStack
										display={{ base: 'none', sm: 'flex' }}
										gap={3}
										minW={0}
										align='center'
										flex='1'
									>
										<Box
											boxSize='88px'
											rounded='lg'
											position='relative'
											overflow='hidden'
											bgColor='bg.tertiary'
											borderWidth='0.5px'
											borderStyle='solid'
											borderColor='border'
											flexShrink={0}
										>
											<PriorityImageWithFallback
												src={categoryImage}
												fallbackSrc={CATEGORY_PLACEHOLDER_IMAGE}
												alt={category.name}
												sizes='88px'
												loading='eager'
												fetchPriority='high'
												objectFit='cover'
											/>
										</Box>

										<Box flex='1' minW={0}>
											<HStack w='full' justify='space-between' align='center' gap={4}>
												<Text
													fontSize='xl'
													fontWeight='semibold'
													wordBreak='break-word'
													textAlign='left'
													flex='1'
												>
													{category.name}
												</Text>
												<CountPill value={subCount} px='2' py='1' labelProps={{ fontSize: 'md' }} />
											</HStack>
											<Text
												fontSize='md'
												opacity={0.75}
												wordBreak='break-word'
												textAlign='left'
												title={subPreview}
											>
												{subPreview}
											</Text>
										</Box>
									</HStack>
								</Box>
							</AccordionItemTrigger>

							<AccordionItemContent
								px={{ base: 3, md: 4 }}
								pb={{ base: 6, md: 8 }}
								pt={{ base: 3, md: 4 }}
							>
								<SimpleGrid
									columns={{ md: 3, xl: 4 }}
									display={{ base: 'flex', md: 'grid' }}
									flexWrap='wrap'
									justifyContent={{ base: 'center', md: 'flex-start' }}
									gapX='6'
									gapY='8'
									w='full'
								>
									{category.children?.map((subcategory) => {
										const subImage = resolveSubcategoryImage(
											subcategory.imageUrl,
											SUBCATEGORY_PLACEHOLDER_IMAGE,
										);
										const subcategoryHref = `/products/${category.slug}/${subcategory.slug}`;
										return (
											<Box
												key={subcategory.id}
												flex={{ base: `0 1 ${MOBILE_SUBCATEGORY_ITEM_WIDTH_PX}px`, md: '1' }}
											>
												<Flex
													direction='column'
													align={{ base: 'center', md: 'flex-start' }}
													gap='2.5'
													mb='2'
												>
													<DrawerActionTrigger asChild>
														<Link href={subcategoryHref}>
															<Box
																w={{ base: `${MOBILE_SUBCATEGORY_ITEM_WIDTH_PX}px`, md: '140px' }}
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
																	sizes={`(max-width: 767px) ${MOBILE_SUBCATEGORY_ITEM_WIDTH_PX}px, 140px`}
																	loading='eager'
																	fetchPriority='high'
																	objectFit='fill'
																/>
															</Box>
														</Link>
													</DrawerActionTrigger>

													<DrawerActionTrigger asChild>
														<LocaleNavLink
															href={subcategoryHref}
															minW={0}
															display='inline-flex'
															alignItems='center'
															gap='1'
															fontSize={{ base: '16px', md: '15px' }}
															fontWeight='bold'
															textDecoration='none'
															my='1.5'
															color='link'
															_hover={{ transform: 'translateX(2px)', textDecoration: 'underline' }}
														>
															<Text fontSize={{ base: 'lg', md: 'md' }} as='span'>
																{subcategory.name}
															</Text>
															<Icon as='span' fontSize='14px' flexShrink={0}>
																<BsChevronRight />
															</Icon>
														</LocaleNavLink>
													</DrawerActionTrigger>
												</Flex>

												<Stack gap='2' align='flex-start'>
													{subcategory.products.length > 0 ? (
														// Same pill styling/padding as CategoryCard.tsx's product
														// chips (the category page's subcategory list) so this
														// modal's list matches it instead of rendering as plain
														// one-per-line text links.
														<Wrap gap='2'>
															{subcategory.products.map((product) => (
																<DrawerActionTrigger asChild key={product.id}>
																	<LocaleNavLink
																		href={`/products/${product.fullSlug}`}
																		fontSize='sm'
																		fontWeight='medium'
																		bg='bgHover.promoCard'
																		color='main'
																		px='2.5'
																		py='1'
																		rounded='full'
																		textWrap='wrap'
																		wordBreak='break-word'
																		textDecoration='none'
																		_hover={{ color: 'link', bg: 'bgHover.DEFAULT' }}
																		_focusVisible={{
																			outline: '2px solid',
																			outlineColor: 'main.secondary',
																			outlineOffset: '2px',
																		}}
																	>
																		{product.name}
																	</LocaleNavLink>
																</DrawerActionTrigger>
															))}
														</Wrap>
													) : (
														<Text fontSize='15px' color='gray.500'>
															{productsT('productsNotFound')}
														</Text>
													)}

													<DrawerActionTrigger asChild>
														<LocaleNavLink
															href={subcategoryHref}
															fontSize={{ base: 'md', md: '15px' }}
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
															{t('seeAll')}
														</LocaleNavLink>
													</DrawerActionTrigger>
												</Stack>
											</Box>
										);
									})}
								</SimpleGrid>

								<HStack justify='flex-end' mt={{ base: 4, md: 5 }}>
									<DrawerActionTrigger asChild>
										<LocaleNavSecButton href={`/products/${category.slug}`} size='sm'>
											{t('seeCategory')} <BsChevronRight />
										</LocaleNavSecButton>
									</DrawerActionTrigger>
								</HStack>
							</AccordionItemContent>
						</AccordionItem>
					);
				})}
			</AccordionRoot>
		</Box>
	);
}
