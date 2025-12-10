'use client';

import { Box, Flex, Text, VStack, Heading, Wrap, Badge } from '@chakra-ui/react';
import { BsChevronRight } from 'react-icons/bs';
import { LocaleNavLink, LocaleNavButton } from '@/components/ui/links/LocaleNavLink';
import type { I18nData } from '@/types/i18n';
import type { CatalogCategory } from '@/types/product';

interface Props {
	i18nData: I18nData;
	category: CatalogCategory | null;
}

export default function CategoryDetails({ category, i18nData }: Props) {
	if (!category) return null;

	const categoryBg = category.imageUrl ?? '/assets/images/temp/1.webp';

	return (
		<Flex bg='bg.tertiary' overflowY='auto' rounded='sm' boxShadow='sm' w='100%' p={4}>
			<Wrap gap={12} justify='flex-start' position='relative' w={{ base: '100%', lg: '75%' }}>
				{category.children?.map((subcategory) => (
					<Box key={subcategory.id} maxW='32%'>
						<Text ml='1' fontWeight='semibold' textStyle='lg' mb={4}>
							{subcategory.name}
						</Text>

						<VStack align='start' gap='4' pb='4'>
							{subcategory.products.map((product) => (
								<Badge
									key={product.id}
									variant='outline'
									size='md'
									bg='bg.tertiary'
									px='1.5'
									py='1'
									boxShadow='none'
								>
									<LocaleNavLink
										href={`/products/${product.fullSlug}`}
										fontSize='md'
										variant='plain'
										fontWeight='normal'
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
			</Wrap>

			<Flex
				justify='space-between'
				direction='column'
				align='center'
				bgColor='catalog.bgCategory'
				h='full'
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
					top: '30%',
					left: '10%',
					height: '180px',
					width: '80%',
					backgroundImage: {
						base: `url("${categoryBg}")`,
						_dark: `url("${categoryBg}")`,
					},
					rounded: 'sm',
					border: '1px solid',
					borderColor: 'gray.500',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
					backgroundSize: 'auto',
					zIndex: -1,
				}}
			>
				<Heading color='main' size='2xl' fontWeight='medium' borderBottom='1px solid' pb='1'>
					{category.name}
				</Heading>

				<LocaleNavButton href={`/products/${category.slug}`} minW='240px'>
					{i18nData.seeCategory}
					<BsChevronRight />
				</LocaleNavButton>
			</Flex>
		</Flex>
	);
}
