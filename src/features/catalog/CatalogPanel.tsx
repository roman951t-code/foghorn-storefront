'use client';

import { useState, useRef } from 'react';
import { Flex, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { BsChevronRight } from 'react-icons/bs';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import CategoryDetails from './CategoryDetails';
import Promo from './Promo';
import type { I18nData } from '@/types/i18n';
import { useCatalog } from '@/providers/CatalogProvider';
import type { CatalogCategory } from '@/types/product';

interface Props {
	i18nData: I18nData;
}

export default function CatalogPanel({ i18nData }: Props) {
	const { categories } = useCatalog();

	const [activeCategory, setActiveCategory] = useState<CatalogCategory | null>(null);
	const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

	const handleMouseEnter = (category: CatalogCategory) => {
		if (hoverTimeout.current) {
			clearTimeout(hoverTimeout.current);
		}
		hoverTimeout.current = setTimeout(() => {
			setActiveCategory(category);
		}, 200);
	};

	const handleMouseLeave = () => {
		if (hoverTimeout.current) {
			clearTimeout(hoverTimeout.current);
			hoverTimeout.current = null;
		}
		setActiveCategory(null);
	};

	return (
		<Flex position='relative' rounded='md' gap={2} onMouseLeave={handleMouseLeave} minH='472px'>
			<VStack
				minW='280px'
				w='280px'
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
						key={category.id}
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
			{activeCategory && <CategoryDetails category={activeCategory} i18nData={i18nData} />}
		</Flex>
	);
}
