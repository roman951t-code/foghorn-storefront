import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
import { Box, VStack, Flex, Text, Link, Heading } from '@chakra-ui/react';
import { LocaleNavLink } from '../links/LocaleNavLink';

const categories = [
	{
		name: 'Electronics',
		subcategories: [
			{ title: 'Mobiles', links: ['iPhone', 'Samsung', 'OnePlus'] },
			{ title: 'Laptops', links: ['MacBook', 'Dell', 'HP'] },
			{ title: 'Smartphones', links: ['MacBook', 'Dell', 'HP'] },
			{ title: 'Calculators', links: ['MacBook', 'Dell', 'HP'] },
		],
	},
	{
		name: 'Fashion',
		subcategories: [
			{ title: 'Men', links: ['Shirts', 'Pants', 'Shoes'] },
			{ title: 'Women', links: ['Dresses', 'Handbags', 'Jewelry'] },
			{ title: 'Kitchen', links: ['Refrigerators', 'Microwaves', 'Ovens'] },
			{ title: 'Living Room', links: ['Televisions', 'Speakers', 'Sofas'] },
		],
	},
];

export default function CatalogDrawer() {
	const t = useTranslations('General');

	return (
		<AccordionRoot multiple defaultValue={['electronics']}>
			{categories.map((category) => (
				<AccordionItem
					key={category.name}
					value={category.name.toLowerCase()}
					borderBottom='1px dotted'
					borderBottomColor='border.dark'
					mb='4'
				>
					<AccordionItemTrigger>
						<Heading fontWeight='semibold' textStyle='2xl' color='main' borderBottom='1px solid'>
							{category.name}
						</Heading>
					</AccordionItemTrigger>
					<AccordionItemContent>
						<Flex wrap='wrap' gap={4} justify='flex-start' position='relative' w='100%'>
							{category.subcategories.map((subcategory) => (
								<Box key={subcategory.title} minW='175px'>
									<Text fontWeight='medium' textStyle='xl' mb={4}>
										{subcategory.title}
									</Text>
									<VStack align='start' gap={4}>
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
											{t('seeAll')}
										</LocaleNavLink>
									</VStack>
								</Box>
							))}
						</Flex>
					</AccordionItemContent>
				</AccordionItem>
			))}
		</AccordionRoot>
	);
}
