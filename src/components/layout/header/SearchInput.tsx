'use client';
import {
	Combobox,
	Group,
	Heading,
	Icon,
	IconButton,
	Spinner,
	useListCollection,
	Wrap,
} from '@chakra-ui/react';
import { useDebounce } from 'react-use';
import { useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { SearchProductItem, SearchSubcategoryItem } from '@/types/product';
import { IoPricetagsOutline } from 'react-icons/io5';
import { CategorySearchItem, ProductSearchItem, SeeAllLink } from './SearchItem';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

interface SearchResponse {
	products: SearchProductItem[];
	subcategories: SearchSubcategoryItem[];
}

interface Props {
	placeholder: string;
	notFound: string;
	products: string;
	categories: string;
	seeAll: string;
	hideBelow?: string;
}

export default function SearchInput({
	placeholder,
	notFound,
	hideBelow,
	seeAll,
	products,
	categories,
}: Props) {
	const router = useRouter();
	const locale = useLocale();
	const [inputValue, setInputValue] = useState('');
	const [hasSearched, setHasSearched] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [subcategories, setSubcategories] = useState<SearchSubcategoryItem[]>([]);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const searchQuery = inputValue.trim();
	const searchResultsLink = `/products/search/?searchQuery=${encodeURIComponent(searchQuery)}`;
	const clearSearch = () => {
		setInputValue('');
		set([]);
		setSubcategories([]);
		setHasSearched(false);
		setIsLoading(false);
		setIsOpen(false);
	};
	const redirectToSearch = () => {
		const query = (inputRef.current?.value ?? inputValue).trim();

		if (!query) {
			return;
		}

		router.push(`/products/search/?searchQuery=${encodeURIComponent(query)}`);
	};

	const { collection, set } = useListCollection<SearchProductItem>({
		initialItems: [],
		itemToString: (item) => item.name,
		itemToValue: (item) => `${item.category}/${item.subcategory}/${item.product}`,
	});
	const cache = useRef<Map<string, SearchResponse>>(new Map());
	useDebounce(
		async () => {
			if (!inputValue || inputValue.length < 2) {
				set([]);
				setSubcategories([]);
				setHasSearched(false);
				setIsLoading(false);
				return;
			}

			setHasSearched(true);
			setIsLoading(true);
			const cacheKey = `${locale}:${inputValue}`;

			if (cache.current.has(cacheKey)) {
				const cached = cache.current.get(cacheKey)!;

				const isRelevant = cached.products.some((p) =>
					p.name.toLowerCase().includes(inputValue.toLowerCase()),
				);

				if (isRelevant) {
					set(cached.products);
					setSubcategories(cached.subcategories);
					setIsLoading(false);
					return;
				}
			}

			try {
				const res = await fetch(
					`/api/products/search?q=${encodeURIComponent(inputValue)}&locale=${encodeURIComponent(locale)}`,
				);
				const data: SearchResponse = await res.json();
				cache.current.set(cacheKey, data);
				set(data.products);
				setSubcategories(data.subcategories);
			} catch {
				set([]);
				setSubcategories([]);
			} finally {
				setIsLoading(false);
			}
		},
		400,
		[inputValue, locale],
	);

	return (
		<Group
			as='form'
			role='search'
			onSubmit={(event) => {
				event.preventDefault();
				redirectToSearch();
			}}
			flex='1'
			hideBelow={hideBelow}
			px={{ base: '0px', md: '20px' }}
			attached
		>
			<Combobox.Root
				variant='subtle'
				collection={collection}
				size='md'
				selectionBehavior='preserve'
				inputValue={inputValue}
				open={isOpen}
				onOpenChange={(details) => setIsOpen(details.open)}
				onInputValueChange={(e) => {
					setInputValue(e.inputValue);
					setIsOpen(e.inputValue.trim().length > 0);
				}}
				positioning={{ flip: false, gutter: 2 }}
			>
				<Combobox.Control roundedLeft='md' fontSize='md' minW='284px'>
					<Combobox.Input
						ref={inputRef}
						borderColor='gray.200'
						_focus={{ borderColor: { base: 'gray.200', _dark: 'yellow.500' } }}
						placeholder={placeholder}
						aria-label={placeholder}
						fontSize='15px'
						bg='bg.muted'
						roundedRight='0'
						onPaste={(event) => {
							if (event.clipboardData.getData('text').trim().length > 0) {
								setIsOpen(true);
							}
						}}
					/>
					<Combobox.IndicatorGroup pr='2'>
						<Combobox.ClearTrigger
							aria-label='Clear search input'
							_hover={{ cursor: 'pointer' }}
							mt='-1'
							hidden={searchQuery.length === 0}
							onClick={clearSearch}
						/>
						<Combobox.Trigger />
					</Combobox.IndicatorGroup>
				</Combobox.Control>

				<Combobox.Positioner>
					<Combobox.Content
						bg='bg.tertiary'
						maxHeight='540px'
						px='2'
						_open={{ animationStyle: 'scale-fade-in' }}
						_closed={{ animationStyle: 'scale-fade-out', animationDuration: 'fast' }}
					>
						{isLoading && (
							<Group justify='center' py='4'>
								<Spinner size='md' color='main.accent' />
							</Group>
						)}

						{hasSearched && !isLoading && collection.items.length === 0 && (
							<Combobox.Empty fontSize={{ base: 'md', md: '15px' }} fontWeight='medium'>
								{notFound}
							</Combobox.Empty>
						)}

						{hasSearched && !isLoading && collection.items.length > 0 && (
							<>
								<Heading
									fontSize='lg'
									fontWeight='medium'
									my='2'
									borderBottomWidth='0.5px'
									borderBottomStyle='solid'
									borderColor='border'
								>
									<Icon ml='1' mr='2.5'>
										<IoPricetagsOutline />
									</Icon>
									{products}
								</Heading>
								{collection.items.map((item) => (
									<ProductSearchItem
										key={`product-${item.category}-${item.subcategory}-${item.product}`}
										item={item}
									/>
								))}

								<SeeAllLink linkTo={searchResultsLink} seeAll={seeAll} />

								{subcategories.length > 0 && (
									<>
										<Heading
											fontSize='lg'
											fontWeight='medium'
											my='2'
											borderBottomWidth='0.5px'
											borderBottomStyle='solid'
											borderColor='border'
										>
											<Icon ml='1' mr='2.5'>
												<IoPricetagsOutline />
											</Icon>
											{categories}
										</Heading>
										<Wrap gap='4' my='3' pl='2'>
											{subcategories.map((item) => (
												<CategorySearchItem
													key={`category-${item.category}-${item.subcategory}`}
													item={item}
												/>
											))}
										</Wrap>
									</>
								)}
							</>
						)}
					</Combobox.Content>
				</Combobox.Positioner>
			</Combobox.Root>

			<IconButton
				aria-label='Search'
				roundedLeft='0'
				roundedRight='sm'
				size='md'
				color='main.darkOnly'
				width='44px'
				bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				type='button'
				onMouseDown={(event) => event.preventDefault()}
				onClick={redirectToSearch}
			>
				<FiSearch />
			</IconButton>
		</Group>
	);
}
