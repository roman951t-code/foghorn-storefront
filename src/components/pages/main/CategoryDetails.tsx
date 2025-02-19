import React from 'react';
import { Box, Flex, Text, VStack, Link, Heading, Button } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

export default function CategoryDetails({ category }) {
	if (!category) {
		return null;
	}

	const t = useTranslations('General');

	return (
		<Box
			bg='bg.tertiary'
			overflowY='auto'
			rounded='sm'
			boxShadow='sm'
			height='100%'
			width={{ base: '74%', mdToLg: '69%' }}
			position='absolute'
			right={0}
			top={0}
			zIndex={10}
			p={5}
		>
			<Flex
				wrap='wrap'
				gap={4}
				justify='flex-start'
				position='relative'
				w={{ base: '100%', lg: '75%' }}
			>
				{category.subcategories.map((subcategory) => (
					<Box key={subcategory.title} minW='175px' maxW='32%'>
						<Text fontWeight='semibold' textStyle='lg' mb={2}>
							{subcategory.title}
						</Text>
						<VStack align='start'>
							{subcategory.links.map((link) => (
								<Link
									key={link}
									fontSize='md'
									variant='plain'
									transition='all 0.25s ease-in-out'
									textWrap='wrap'
									wordBreak='break-all'
									_hover={{ color: 'main.accent', textDecoration: 'none' }}
									_focus={{ outline: 'none' }}
								>
									{link}
								</Link>
							))}
							<Link
								fontSize='md'
								variant='plain'
								transition='color 0.25s ease-in-out'
								textWrap='wrap'
								wordBreak='break-all'
								color='main.accent'
								_focus={{ outline: 'none' }}
							>
								{t('seeAll')}
							</Link>
						</VStack>
					</Box>
				))}
			</Flex>
			<Flex
				justify='space-between'
				flexDirection='column'
				align='center'
				bg='bg.dark'
				height='100%'
				maxW='380px'
				minW='280px'
				position='absolute'
				right={0}
				border='1px dotted'
				borderColor='gray.500'
				top={0}
				zIndex={10}
				p={4}
				hideBelow='lg'
				boxShadow='inset'
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
				<Heading color='main.lightOnly' size='2xl' fontWeight='medium'>
					{category.name}
				</Heading>
				<Button
					color='main.darkOnly'
					variant='solid'
					width='100%'
					mb='1'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				>
					{t('seeCategory')}
				</Button>
			</Flex>
		</Box>
	);
}
