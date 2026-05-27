'use client';
import { Box, Combobox, Highlight, Icon, Tag, Text, useComboboxContext } from '@chakra-ui/react';
import { LocaleNavLink, LocaleSearchLink } from '@/components/ui/links/LocaleNavLink';
import { FiSearch } from 'react-icons/fi';
import { SearchProductItem, SearchSubcategoryItem } from '@/types/product';

const formatSearchMeta = (value: string) => {
	const text = value.replace(/[-_]+/g, ' ').trim();
	return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
};

const highlightStyles = {
	bg: { base: 'rgba(255, 214, 102, 0.55)', _dark: 'rgba(255, 214, 102, 0.75)' },
	color: { base: 'black', _dark: 'black' },
	fontWeight: 'semibold',
	px: '1',
	rounded: 'sm',
} as const;

export function ProductSearchItem({ item }: { item: SearchProductItem }) {
	const combobox = useComboboxContext();
	const href = `/products/${item.category}/${item.subcategory}/${item.product}`;
	const productKey = `${item.category}/${item.subcategory}/${item.product}`;
	const categoryLabel = item.categoryName?.trim() || formatSearchMeta(item.category);
	const subcategoryLabel = item.subcategoryName?.trim() || formatSearchMeta(item.subcategory);

	return (
		<Combobox.Item item={item} key={productKey} fontSize={{ base: 'md', md: 'sm' }} minW='90px' w='full' py='0'>
			<Combobox.ItemText
				fontWeight='medium'
				as='div'
				css={{
					'& a': {
						width: '100%',
						display: 'block',
					},
				}}
			>
				<LocaleSearchLink asChild href={href} textDecoration='none' fontSize={{ base: 'md', md: '15px' }}>
					<Box py='1' minH='38px' display='flex' flexWrap='wrap' alignItems='center' columnGap='3'>
						<Text
							fontSize={{ base: 'md', md: '15px' }}
							lineHeight='1.25'
							flex='1 1 auto'
							minW='0'
							whiteSpace='nowrap'
							overflow='hidden'
							textOverflow='ellipsis'
						>
							<Highlight ignoreCase query={combobox.inputValue} styles={highlightStyles}>
								{item.name}
							</Highlight>
						</Text>
						<Text
							fontSize={{ base: 'md', md: '15px' }}
							color='fg.muted'
							lineHeight='1.25'
							flex='0 0 auto'
							whiteSpace='nowrap'
						>
							{categoryLabel} / {subcategoryLabel}
						</Text>
					</Box>
				</LocaleSearchLink>
			</Combobox.ItemText>
		</Combobox.Item>
	);
}

export function CategorySearchItem({ item }: { item: SearchSubcategoryItem }) {
	const combobox = useComboboxContext();
	const href = `/products/${item.category}/${item.subcategory}`;
	const categoryKey = `${item.category}/${item.subcategory}`;

	return (
		<Combobox.Item item={item} key={categoryKey} flex='none' p='0' _hover={{ bg: 'transparent' }}>
			<Tag.Root
				variant='surface'
				borderWidth='0.5px'
				boxShadow='none'
				bg='bg.tertiary'
				borderColor='border'
				size='lg'
				color='main'
				py='2'
				w='max-content'
			>
				<LocaleSearchLink asChild href={href} textDecoration='none' fontSize={{ base: 'md', md: '15px' }}>
					<Tag.Label fontWeight='medium' w='auto'>
						<Icon mr='1'>
							<FiSearch />
						</Icon>
						<Highlight
							ignoreCase
							query={combobox.inputValue}
							styles={highlightStyles}
						>
							{item.name}
						</Highlight>
					</Tag.Label>
				</LocaleSearchLink>
			</Tag.Root>
		</Combobox.Item>
	);
}

type SeeAllLinkProps = {
	linkTo: string;
	seeAll: string;
};

export function SeeAllLink({ linkTo, seeAll }: SeeAllLinkProps) {
	return (
		<Combobox.Item
			item='seeAll'
			key='seeAll'
			fontSize={{ base: 'md', md: 'sm' }}
			minW='90px'
			w='full'
			py='0'
			css={{
				'& a': {
					width: '100%',
					display: 'inline-block',
				},
			}}
		>
			<LocaleNavLink
				href={linkTo}
				fontSize='md'
				variant='plain'
				transition='color 0.25s ease-in-out'
				textWrap='wrap'
				wordBreak='break-word'
				color='link'
				mt='3'
				mb='4'
				ml='2'
				textDecoration='underline'
				textUnderlineOffset='4px'
				_focusVisible={{ outline: '2px solid', outlineColor: 'main.secondary', outlineOffset: '2px' }}
			>
				{seeAll}
			</LocaleNavLink>
		</Combobox.Item>
	);
}
