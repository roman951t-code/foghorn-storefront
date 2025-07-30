'use client';

import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/reusable/chakra/accordion';
import { useTranslations } from 'next-intl';
import { Box, VStack, Flex, Text, Heading, HStack } from '@chakra-ui/react';
import { LocaleNavLink, LocaleNavSecButton } from '../links/LocaleNavLink';
import { useCatalog } from '@/components/providers/CatalogProvider';
import { BsChevronRight } from 'react-icons/bs';

export default function CatalogDrawer() {
	const t = useTranslations('General');
	const { categories } = useCatalog();

	return (
		<AccordionRoot multiple defaultValue={[categories?.[0]?.slug]}>
			{categories.map((category) => (
				<AccordionItem
					key={category.id}
					value={category.slug}
					borderBottom='1px dotted'
					borderBottomColor='border.dark'
					mb='4'
				>
					<AccordionItemTrigger>
						<Heading
							fontWeight='semibold'
							textStyle='2xl'
							color='main'
							borderBottom='1px solid'
							mb='2'
						>
							{category.name}
						</Heading>
					</AccordionItemTrigger>

					<AccordionItemContent justifyContent='space-between'>
						<Flex
							wrap='wrap'
							gapX='4'
							gapY='8'
							justifyContent='flex-start'
							position='relative'
							w='100%'
						>
							{category.children.map((sub) => (
								<Box key={sub.id} minW='175px'>
									<Text fontWeight='medium' textStyle='xl' mb={4}>
										{sub.name}
									</Text>
									<VStack align='start' gap={4}>
										<LocaleNavLink
											href={`/catalog/`}
											fontSize='md'
											variant='plain'
											textWrap='wrap'
											wordBreak='break-all'
										>
											{sub.name}
										</LocaleNavLink>

										<LocaleNavLink
											href={`/catalog/${sub.slug}`}
											fontSize='md'
											variant='plain'
											transition='color 0.25s ease-in-out'
											textWrap='wrap'
											wordBreak='break-all'
											color='link'
											mt='3'
											textDecoration='underline'
											textUnderlineOffset='4px'
											_focus={{ outline: 'none' }}
										>
											{t('seeAll')}
										</LocaleNavLink>
									</VStack>
								</Box>
							))}
							<LocaleNavSecButton href={`/products/catalog/${category.slug}`}>
								{t('seeCategory')} <BsChevronRight />
							</LocaleNavSecButton>
						</Flex>
					</AccordionItemContent>
				</AccordionItem>
			))}
		</AccordionRoot>
	);
}
