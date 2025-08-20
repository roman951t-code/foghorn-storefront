'use client';
import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/reusable/chakra/accordion';
import { useTranslations } from 'next-intl';
import { Box, VStack, Text, Heading, Wrap, Badge } from '@chakra-ui/react';
import { LocaleNavLink, LocaleNavSecButton } from '../links/LocaleNavLink';
import { useCatalog } from '@/components/providers/CatalogProvider';
import { BsChevronRight } from 'react-icons/bs';

export default function CatalogDrawer() {
	const t = useTranslations('General');
	const { categories } = useCatalog();

	return (
		<AccordionRoot multiple defaultValue={[categories?.[0]?.slug]} w='full'>
			{categories.map((category) => (
				<AccordionItem
					key={category.id}
					value={category.slug}
					borderBottom='1px dotted'
					borderBottomColor='border.dark'
					mb='4'
				>
					<AccordionItemTrigger cursor='pointer'>
						<Heading fontWeight='medium' textStyle='2xl' color='main' mb='2'>
							{category.name}
						</Heading>
					</AccordionItemTrigger>

					<AccordionItemContent justifyContent='space-between'>
						<VStack
							gap={8}
							justifyContent='flex-start'
							alignItems='flex-start'
							position='relative'
							w='100%'
						>
							{category.children?.map((subcategory) => (
								<Box key={subcategory.id}>
									<LocaleNavLink
										href={`/products/${category.slug}/${subcategory.slug}`}
										fontSize='md'
										fontWeight='medium'
										textStyle='xl'
										variant='plain'
										transition='color 0.25s ease-in-out'
										textWrap='wrap'
										wordBreak='break-all'
										color='main'
										textDecoration='underline'
										textUnderlineOffset='6px'
										mb={6}
										_focus={{ outline: 'none' }}
									>
										{subcategory.name}
									</LocaleNavLink>

									<Wrap align='center' gap='6'>
										{subcategory.products.map((product) => (
											<Badge
												key={product.id}
												variant='outline'
												size='md'
												borderWidth='0.5px'
												bg='bg.tertiary'
												px='1.5'
												py='1'
												boxShadow='none'
												borderColor='border.light'
											>
												<LocaleNavLink
													href={`/products/${product.fullSlug}`}
													fontSize='15px'
													variant='plain'
													textWrap='wrap'
													wordBreak='break-word'
													_hover={{ color: 'link' }}
													_focus={{ outline: 'none' }}
												>
													{product.name}
												</LocaleNavLink>
											</Badge>
										))}

										<LocaleNavLink
											href={`/products/${category.slug}/${subcategory.slug}`}
											fontSize='md'
											variant='plain'
											transition='color 0.25s ease-in-out'
											textWrap='wrap'
											wordBreak='break-all'
											color='link'
											textDecoration='underline'
											textUnderlineOffset='4px'
											_focus={{ outline: 'none' }}
										>
											{t('seeAll')}
										</LocaleNavLink>
									</Wrap>
								</Box>
							))}

							<LocaleNavSecButton href={`/products/${category.slug}`} size='sm'>
								{t('seeCategory')} <BsChevronRight />
							</LocaleNavSecButton>
						</VStack>
					</AccordionItemContent>
				</AccordionItem>
			))}
		</AccordionRoot>
	);
}
