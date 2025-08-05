'use client';

import {
	Combobox,
	Group,
	Heading,
	Highlight,
	IconButton,
	useComboboxContext,
	useListCollection,
} from '@chakra-ui/react';
import { useAsync } from 'react-use';
import { useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { LocaleNavLink } from '../reusable/links/LocaleNavLink';

interface ProductItem {
	label: string;
	value: string;
}

function ComboboxItem(props: { item: ProductItem }) {
	const { item } = props;
	const combobox = useComboboxContext();

	return (
		<Combobox.Item item={item} key={item.value} fontSize='15px' py='2'>
			<Combobox.ItemText _hover={{ cursor: 'pointer' }} fontWeight='medium'>
				<LocaleNavLink asChild href='/' textDecoration='none' fontSize='15px'>
					<Highlight
						ignoreCase
						query={combobox.inputValue}
						styles={{
							bg: 'yellow.200',
							color: 'black',
							fontWeight: 'medium',
						}}
					>
						{item.value}
					</Highlight>
				</LocaleNavLink>
			</Combobox.ItemText>
		</Combobox.Item>
	);
}

interface Props {
	placeholder: string;
	notFound: string;
	products: string;
	categories: string;
	hideBelow?: string;
}

export default function SearchInput({
	placeholder,
	notFound,
	hideBelow,
	products,
	categories,
}: Props) {
	const [inputValue, setInputValue] = useState('');
	const [hasSearched, setHasSearched] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { collection, set } = useListCollection<ProductItem>({
		initialItems: [],
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
	});

	const cache = useRef<Map<string, ProductItem[]>>(new Map());

	useAsync(async () => {
		if (!inputValue || inputValue.length < 2) {
			set([]);
			setHasSearched(false);
			setIsLoading(false);
			return;
		}

		setHasSearched(true);
		setIsLoading(true);

		if (cache.current.has(inputValue)) {
			set(cache.current.get(inputValue) || []);
			setIsLoading(false);
			return;
		}

		try {
			const res = await fetch(`/api/products/search?q=${encodeURIComponent(inputValue)}`);
			const data = await res.json();
			cache.current.set(inputValue, data);
			set(data);
		} catch (err) {
			set([]);
		} finally {
			setIsLoading(false);
		}
	}, [inputValue]);

	return (
		<Group flex='1' hideBelow={hideBelow} px={{ base: '0px', md: '20px' }} attached>
			<Combobox.Root
				variant='subtle'
				collection={collection}
				size='md'
				openOnChange={(e) => e.inputValue.length > 1}
				onInputValueChange={(e) => setInputValue(e.inputValue)}
				positioning={{ flip: false, gutter: 2 }}
			>
				<Combobox.Control roundedLeft='md' fontSize='sm' minWidth='284px' bg='bg'>
					<Combobox.Input
						placeholder={placeholder}
						_placeholder={{ fontSize: 'sm' }}
						fontSize='md'
						roundedRight='0'
						_focus={{
							border: '1px solid',
							borderColor: { base: 'orange', _dark: 'yellow' },
							outline: 'none',
						}}
					/>
					<Combobox.IndicatorGroup pr='2'>
						<Combobox.ClearTrigger _hover={{ cursor: 'pointer' }} mt='-1' />
						<Combobox.Trigger />
					</Combobox.IndicatorGroup>
				</Combobox.Control>

				<Combobox.Positioner>
					<Combobox.Content
						px='2'
						_open={{ animationStyle: 'scale-fade-in' }}
						_closed={{
							animationStyle: 'scale-fade-out',
							animationDuration: 'fast',
						}}
					>
						{hasSearched && !isLoading && collection.items.length === 0 && (
							<Combobox.Empty fontSize='15px'>{notFound}</Combobox.Empty>
						)}

						<Heading fontSize='lg' fontWeight='normal' my='2'>
							{products}
						</Heading>
						{collection.items.map((item) => (
							<ComboboxItem item={item} key={item.value} />
						))}
						<Heading fontSize='lg' fontWeight='normal' my='2'>
							{categories}
						</Heading>
						{collection.items.map((item) => (
							<ComboboxItem item={item} key={item.value} />
						))}
					</Combobox.Content>
				</Combobox.Positioner>
			</Combobox.Root>

			<IconButton
				aria-label='Search'
				roundedLeft='0'
				roundedRight='md'
				size='md'
				color='main.darkOnly'
				width='44px'
				bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
			>
				<FiSearch />
			</IconButton>
		</Group>
	);
}
