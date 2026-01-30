'use client';
import { Combobox, Highlight, Icon, Tag, useComboboxContext } from '@chakra-ui/react';
import { LocaleNavLink, LocaleSearchLink } from '@/components/ui/links/LocaleNavLink';
import { FiSearch } from 'react-icons/fi';
import { SearchProductItem, SearchSubcategoryItem } from '@/types/product';

export function ProductSearchItem({ item }: { item: SearchProductItem }) {
	const combobox = useComboboxContext();
	const href = `/products/${item.category}/${item.subcategory}/${item.product}`;

	return (
		<Combobox.Item item={item} key={item.name} fontSize='sm' minW='90px' w='full' py='0'>
			<Combobox.ItemText
				fontWeight='medium'
				as='p'
				css={{
					'& a': {
						width: '100%',
						display: 'inline-block',
						lineHeight: '38px',
					},
				}}
			>
				<LocaleSearchLink asChild href={href} textDecoration='none' fontSize='15px'>
					<Highlight
						ignoreCase
						query={combobox.inputValue}
						styles={{ bg: 'bg.search', color: 'black', fontWeight: 'semibold' }}
					>
						{item.name}
					</Highlight>
				</LocaleSearchLink>
			</Combobox.ItemText>
		</Combobox.Item>
	);
}

export function CategorySearchItem({ item }: { item: SearchSubcategoryItem }) {
	const combobox = useComboboxContext();
	const href = `/products/${item.category}/${item.subcategory}`;

	return (
		<Combobox.Item item={item} key={item.name} flex='none' p='0' _hover={{ bg: 'transparent' }}>
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
				<LocaleSearchLink asChild href={href} textDecoration='none' fontSize='15px'>
					<Tag.Label fontWeight='medium' w='auto'>
						<Icon mr='1'>
							<FiSearch />
						</Icon>
						<Highlight
							ignoreCase
							query={combobox.inputValue}
							styles={{ bg: 'bg.search', color: 'black', fontWeight: 'semibold' }}
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
			fontSize='sm'
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
				_focus={{ outline: 'none' }}
			>
				{seeAll}
			</LocaleNavLink>
		</Combobox.Item>
	);
}
