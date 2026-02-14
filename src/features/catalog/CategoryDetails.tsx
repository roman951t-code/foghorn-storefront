'use client';

import { Badge, Box, Flex, Heading, Icon, SimpleGrid, Text, Wrap } from '@chakra-ui/react';
import Image from 'next/image';
import { BsChevronRight } from 'react-icons/bs';
import { LocaleNavLink, LocaleNavButton } from '@/components/ui/links/LocaleNavLink';
import { CATEGORY_DETAILS_GRID_CSS } from '@/constants/grids';
import type { I18nData } from '@/types/i18n';
import type { CatalogCategory } from '@/types/product';

interface Props {
	i18nData: I18nData;
	category: CatalogCategory | null;
}

export default function CategoryDetails({ category, i18nData }: Props) {
	if (!category) return null;

	const categoryBg = category.imageUrl ?? '/assets/images/temp/1Big.webp';
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
			<Flex flex='1' minW={0} direction='row' h='full'>
				<Box
					flex='1'
					minW={0}
					h='full'
					overflowY='auto'
					p='4'
					bgGradient='linear(to-b, rgba(255,255,255,0.04), rgba(255,255,255,0.0))'
				>
					<SimpleGrid
						css={CATEGORY_DETAILS_GRID_CSS}
						justifyContent='start'
						gap='4'
						pr={{ base: 0, lg: '256px' }}
					>
						{subcategories.map((subcategory) => {
							const subImage = subcategory.imageUrl ?? '/assets/images/temp/3Big.webp';

							return (
								<Box
									key={subcategory.id}
									w='full'
									rounded='lg'
									borderWidth='0.5px'
									borderStyle='solid'
									borderColor='border'
									bg='bg.tertiary'
									overflow='hidden'
									transition='all 0.18s ease-in-out'
									_hover={{ transform: 'translateY(-1px)', borderColor: 'main.secondary' }}
								>
									<Box
										h='72px'
										bgImage={`url(${subImage})`}
										bgSize='cover'
										bgPos='center'
										position='relative'
									>
										<Box
											position='absolute'
											inset='0'
											bgGradient='linear(to-t, rgba(0,0,0,0.62), rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.0))'
										/>
									</Box>

									<Box p={4}>
										<LocaleNavLink
											href={`/products/${category.slug}/${subcategory.slug}`}
											fontSize='lg'
											fontWeight='semibold'
											variant='plain'
											color='main'
											textDecoration='none'
											textWrap='wrap'
											wordBreak='break-word'
											_hover={{ color: 'link' }}
											display='inline-flex'
											alignItems='center'
											gap={2}
										>
											<Text as='span' lineClamp={1}>
												{subcategory.name}
											</Text>
											<Icon as='span' fontSize='16px' color='gray.500'>
												<BsChevronRight />
											</Icon>
										</LocaleNavLink>

										<Wrap mt={3} gap={4} align='center'>
											{subcategory.products.map((product) => (
												<Badge
													key={product.id}
													variant='outline'
													size='md'
													borderWidth='0.5px'
													bg='bg.tertiary'
													px='0'
													py='1'
													boxShadow='none'
													border='none'
												>
													<LocaleNavLink
														href={`/products/${product.fullSlug}`}
														fontSize='15px'
														fontWeight='medium'
														textWrap='wrap'
														wordBreak='break-word'
														textDecorationColor='main'
														color='main'
														variant='underline'
														_hover={{ color: 'link' }}
														_focusVisible={{
															outline: '2px solid',
															outlineColor: 'main.secondary',
															outlineOffset: '2px',
														}}
													>
														{product.name}
													</LocaleNavLink>
												</Badge>
											))}

											<LocaleNavLink
												href={`/products/${category.slug}/${subcategory.slug}`}
												fontSize='sm'
												variant='plain'
												color='link'
												mt='1'
												textDecoration='underline'
												textUnderlineOffset='4px'
												_focusVisible={{
													outline: '2px solid',
													outlineColor: 'main.secondary',
													outlineOffset: '2px',
												}}
											>
												{i18nData.seeAll}
											</LocaleNavLink>
										</Wrap>
									</Box>
								</Box>
							);
						})}
					</SimpleGrid>
				</Box>

				<Flex
					justify='space-between'
					direction='column'
					align='center'
					bgColor='catalog.bgCategory'
					h='full'
					maxW='380px'
					minW={{ base: '240px', xl: '280px' }}
					position='absolute'
					right={0}
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					borderRadius='lg'
					top={0}
					zIndex={10}
					p={4}
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
						mt={4}
						overflow='hidden'
						rounded='lg'
						borderWidth='0.5px'
						borderStyle='solid'
						borderColor='border'
					>
						<Image
							key={categoryBg}
							src={categoryBg}
							alt={category.name}
							fill
							sizes='(min-width: 80em) 260px, 240px'
							style={{
								objectFit: 'cover',
							}}
							loading='lazy'
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
