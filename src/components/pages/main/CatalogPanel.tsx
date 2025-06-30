'use client';
import React, { useState } from 'react';
import { Flex, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { BsChevronRight } from 'react-icons/bs';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import CategoryDetails from './CategoryDetails';
import Promo from './Promo';
import type { I18nData } from '@/types/i18n';

interface Props {
	i18nData: I18nData;
}

const categories = [
	{
		name: 'Electronics',
		subcategories: [
			{ title: 'Mobiles', links: ['iPhone', 'Samsung', 'OnePlus'] },
			{ title: 'Laptops', links: ['MacBook', 'Dell', 'HP'] },
			{ title: 'Kitchen', links: ['Refrigerators', 'Microwaves', 'Ovens'] },
			{ title: 'Living Room', links: ['Televisions', 'Speakers', 'Sofas'] },
		],
	},
	{
		name: 'Fashion',
		subcategories: [
			{ title: 'Men', links: ['Shirts', 'Pants', 'Shoes'] },
			{ title: 'Women', links: ['Dresses', 'Handbags', 'Jewelry'] },
		],
	},
	{
		name: 'Home Appliances',
		subcategories: [
			{ title: 'Kitchen', links: ['Refrigerators', 'Microwaves', 'Ovens'] },
			{ title: 'Living Room', links: ['Televisions', 'Speakers', 'Sofas'] },
		],
	},
	{
		name: 'Kitchen',
		subcategories: [
			{ title: 'Mobiles', links: ['iPhone', 'Samsung', 'OnePlus'] },
			{ title: 'Laptops', links: ['MacBook', 'Dell', 'HP'] },
		],
	},
	{
		name: 'Household',
		subcategories: [
			{ title: 'Men', links: ['Shirts', 'Pants', 'Shoes'] },
			{ title: 'Women', links: ['Dresses', 'Handbags', 'Jewelry'] },
		],
	},
	{
		name: 'Backyard',
		subcategories: [
			{ title: 'Kitchen', links: ['Refrigerators', 'Microwaves', 'Ovens'] },
			{ title: 'Living Room', links: ['Televisions', 'Speakers', 'Sofas'] },
		],
	},
	{
		name: 'Digital',
		subcategories: [
			{ title: 'Mobiles', links: ['iPhone', 'Samsung', 'OnePlus'] },
			{ title: 'Laptops', links: ['MacBook', 'Dell', 'HP'] },
		],
	},
	{
		name: 'Cost free',
		subcategories: [
			{ title: 'Men', links: ['Shirts', 'Pants', 'Shoes'] },
			{ title: 'Women', links: ['Dresses', 'Handbags', 'Jewelry'] },
		],
	},
	{
		name: 'Second hand',
		subcategories: [
			{ title: 'Kitchen', links: ['Refrigerators', 'Microwaves', 'Ovens'] },
			{ title: 'Living Room', links: ['Televisions', 'Speakers', 'Sofas'] },
		],
	},
];

export default function CatalogPanel({ i18nData }: Props) {
	const [activeCategory, setActiveCategory] = useState();

	const handleMouseEnter = (category) => {
		setActiveCategory(category);
	};

	const handleMouseLeave = () => {
		setActiveCategory(null);
	};

	return (
		<Flex h='500px' position='relative' rounded='md' gap={2} onMouseLeave={handleMouseLeave}>
			<VStack
				minW='300px'
				w='300px'
				align='stretch'
				gap='0'
				boxShadow='sm'
				rounded='md'
				hideBelow='md'
				overflow='hidden'
				mr='2'
			>
				<CatalogBtn fullText />
				{categories.map((category, index) => (
					<HStack
						key={category.name}
						justify='space-between'
						bg={index % 2 === 0 ? 'catalog.bgEven' : 'catalog.bgOdd'}
						align='center'
						px={4}
						py={2.5}
						h='54px'
						borderTop='1px dotted'
						borderColor={{ base: 'gray.200', _dark: 'gray.500' }}
						transition='background 0.25s ease-in-out'
						_hover={{
							cursor: 'pointer',
							bg: 'gray.200',
							color: 'main.darkOnly',
						}}
						onMouseEnter={() => handleMouseEnter(category)}
					>
						<Text fontSize='17px' fontWeight='normal'>
							{category.name}
						</Text>
						<Icon fontSize='20px' color='main'>
							<BsChevronRight />
						</Icon>
					</HStack>
				))}
			</VStack>
			{!activeCategory && <Promo />}
			<CategoryDetails category={activeCategory} i18nData={i18nData} />
		</Flex>
	);
}
