'use client';

import React from 'react';
import { Box, Flex, Text, VStack, Heading } from '@chakra-ui/react';
import { BsChevronRight } from 'react-icons/bs';
import { LocaleNavLink, LocaleNavButton } from '@/components/reusable/links/LocaleNavLink';
import type { I18nData } from '@/types/i18n';
import type { Category } from '@/types/product';

interface Props {
	i18nData: I18nData;
	category: Category | null;
}

export default function CategoryDetails({ category, i18nData }: Props) {
	if (!category) return null;

	return (
		<Flex bg='bg.tertiary' overflowY='auto' rounded='sm' boxShadow='sm' w='100%' p={4}>
			<Flex
				wrap='wrap'
				gap={4}
				justify='flex-start'
				position='relative'
				w={{ base: '100%', lg: '75%' }}
			>
				{category.children?.map((subcategory) => (
					<Box key={subcategory.id} minW='175px' maxW='32%'>
						<Text fontWeight='semibold' textStyle='lg' mb={4}>
							{subcategory.name}
						</Text>
						<VStack align='start'>
							<LocaleNavLink
								key={subcategory.id}
								href={`/products/${subcategory.slug}`}
								fontSize='md'
								variant='plain'
								textWrap='wrap'
								wordBreak='break-word'
								_hover={{ color: 'link' }}
								_focus={{ outline: 'none' }}
							>
								{subcategory.name}
							</LocaleNavLink>
							<LocaleNavLink
								href={`/products/${subcategory.slug}`}
								fontSize='md'
								variant='plain'
								transition='color 0.25s ease-in-out'
								textWrap='wrap'
								wordBreak='break-word'
								color='link'
								mt='3'
								textDecoration='underline'
								textUnderlineOffset='4px'
								_focus={{ outline: 'none' }}
							>
								{i18nData.seeAll}
							</LocaleNavLink>
						</VStack>
					</Box>
				))}
			</Flex>

			<Flex
				justify='space-between'
				flexDirection='column'
				align='center'
				bgColor='catalog.bgCategory'
				height='100%'
				maxW='380px'
				minW={{ base: '240px', xl: '280px' }}
				position='absolute'
				boxShadow='sm'
				right={0}
				border='none'
				top={0}
				zIndex={10}
				p={4}
				hideBelow='lg'
				_after={{
					content: `""`,
					position: 'absolute',
					top: 0,
					right: 0,
					height: '100%',
					width: '100%',
					backgroundImage: 'url("/assets/images/logoSmall.webp")',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
					backgroundSize: 'auto',
					zIndex: -1,
				}}
			>
				<Heading color='main' size='2xl' fontWeight='medium' borderBottom='1px solid' pb='1'>
					{category.name}
				</Heading>

				<LocaleNavButton href={`/products/catalog/${category.slug}`} w='100%'>
					{i18nData.seeCategory}
					<BsChevronRight />
				</LocaleNavButton>
			</Flex>
		</Flex>
	);
}
