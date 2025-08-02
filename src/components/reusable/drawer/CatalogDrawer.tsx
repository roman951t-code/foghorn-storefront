'use client';

import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/reusable/chakra/accordion';
import { useTranslations } from 'next-intl';
import { Box, VStack, Text, Heading, Wrap, Separator } from '@chakra-ui/react';
import { LocaleNavLink, LocaleNavSecButton } from '../links/LocaleNavLink';
import { useCatalog } from '@/components/providers/CatalogProvider';
import { BsChevronRight } from 'react-icons/bs';
import { Fragment } from 'react';

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
									<Text fontWeight='medium' textStyle='xl' mb={4}>
										{subcategory.name}
									</Text>

									<Wrap align='start' gap='4'>
										{subcategory.products.map((product) => (
											<Fragment key={product.id}>
												<LocaleNavLink
													key={product.id}
													href={`/products/${category.slug}/${subcategory.slug}/${product.slug}`}
													fontSize='md'
													variant='plain'
													textWrap='wrap'
													wordBreak='break-word'
													_hover={{ color: 'link' }}
													_focus={{ outline: 'none' }}
												>
													{product.name}
												</LocaleNavLink>

												<Separator orientation='vertical' height='4' alignSelf='center' />
											</Fragment>
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
