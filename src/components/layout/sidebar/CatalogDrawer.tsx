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
	Wrap,
	Badge,
	HStack,
	Text,
	SimpleGrid,
	Skeleton,
	Icon,
} from '@chakra-ui/react';
import { DrawerActionTrigger } from '@/components/ui/chakra/drawer';
import { LocaleNavLink, LocaleNavSecButton } from '@/components/ui/links/LocaleNavLink';
import { useCatalog } from '@/providers/CatalogProvider';
import { BsChevronRight } from 'react-icons/bs';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';
import CountPill from '@/components/ui/CountPill';

export default function CatalogDrawer() {
	const t = useTranslations('common');
	const { categories } = useCatalog();

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
				{categories.map((category, categoryIndex) => {
					const categoryImage = category.imageUrl ?? '/assets/images/temp/2Big.webp';
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
								px={{ base: 3, md: 4 }}
								py={{ base: 4, md: 6 }}
								bg='bg.tertiary'
								transition='all 0.18s ease-in-out'
								_hover={{ bg: 'bgHover.promoCard' }}
							>
								<Box w='full' minW={0}>
									<VStack display={{ base: 'flex', sm: 'none' }} align='center' gap='3' w='full'>
										<Box
											boxSize='100px'
											rounded='lg'
											bgImage={`url(${categoryImage})`}
											bgSize='contain'
											bgRepeat='no-repeat'
											bgPos='center'
											bgColor='bg.tertiary'
											borderWidth='0.5px'
											borderStyle='solid'
											borderColor='border'
											flexShrink={0}
										/>

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
											<Text fontSize='md' opacity={0.75} wordBreak='break-word' textAlign='center' title={subPreview}>
												{subPreview}
											</Text>
										</VStack>
									</VStack>

									<HStack display={{ base: 'none', sm: 'flex' }} gap={3} minW={0} align='center' flex='1'>
										<Box
											boxSize='88px'
											rounded='lg'
											bgImage={`url(${categoryImage})`}
											bgSize='cover'
											bgPos='center'
											bgColor='bg.tertiary'
											borderWidth='0.5px'
											borderStyle='solid'
											borderColor='border'
											flexShrink={0}
										/>

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
								<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5} w='full'>
									{category.children?.map((subcategory) => {
										const subImage = subcategory.imageUrl ?? '/assets/images/temp/3Big.webp';
										return (
											<Box
												key={subcategory.id}
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
													h={{ base: '120px', md: '160px' }}
													bgImage={`url(${subImage})`}
													bgSize='cover'
													bgPos='center'
													position='relative'
												>
													<Box
														position='absolute'
														inset='0'
														bgGradient='linear(to-t, rgba(0,0,0,0.62), rgba(0,0,0,0.0))'
													/>
												</Box>

												<Box p={4}>
													<DrawerActionTrigger asChild>
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
															<Text as='span' lineClamp={2}>
																{subcategory.name}
															</Text>
															<Icon as='span' fontSize='16px' color='gray.500'>
																<BsChevronRight />
															</Icon>
														</LocaleNavLink>
													</DrawerActionTrigger>

													<Wrap mt={3} gap={3} align='center'>
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
																<DrawerActionTrigger asChild>
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
																</DrawerActionTrigger>
															</Badge>
														))}

														<DrawerActionTrigger asChild>
															<LocaleNavLink
																href={`/products/${category.slug}/${subcategory.slug}`}
																fontSize='sm'
																variant='plain'
																color='link'
																textDecoration='underline'
																textUnderlineOffset='4px'
															>
																{t('seeAll')}
															</LocaleNavLink>
														</DrawerActionTrigger>
													</Wrap>
												</Box>
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
