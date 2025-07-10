import React from 'react';
import { Box, Flex, Text, VStack, Heading } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { BsChevronRight } from 'react-icons/bs';
import { LocaleNavLink, LocaleNavButton } from '@/components/reusable/links/LocaleNavLink';

interface Props {
	i18nData: I18nData;
	category: unknown;
}

export default function CategoryDetails({ category, i18nData }: Props) {
	if (!category) {
		return null;
	}

	return (
		<Flex bg='bg.tertiary' overflowY='auto' rounded='sm' boxShadow='sm' w='100%' p={4}>
			<Flex
				wrap='wrap'
				gap={4}
				justify='flex-start'
				position='relative'
				w={{ base: '100%', lg: '75%' }}
			>
				{category.subcategories.map((subcategory, index) => (
					<React.Fragment key={subcategory.title}>
						<Box minW='175px' maxW='32%'>
							<Text fontWeight='semibold' textStyle='lg' mb={4}>
								{subcategory.title}
							</Text>
							<VStack align='start'>
								{subcategory.links.map((link) => (
									<LocaleNavLink
										key={link}
										href='/products/123'
										fontSize='md'
										variant='plain'
										textWrap='wrap'
										wordBreak='break-all'
										_hover={{ color: 'link' }}
										_focus={{ outline: 'none' }}
									>
										{link}
									</LocaleNavLink>
								))}
								<LocaleNavLink
									href='/products/123'
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
									{i18nData.seeAll}
								</LocaleNavLink>
							</VStack>
						</Box>
					</React.Fragment>
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
				<LocaleNavButton href='/products/123' w='100%'>
					{i18nData.seeCategory}
					<BsChevronRight />
				</LocaleNavButton>
			</Flex>
		</Flex>
	);
}
