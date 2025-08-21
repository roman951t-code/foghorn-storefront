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
	const [inputValue, setInputValue] = useState('');
	const [hasSearched, setHasSearched] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [subcategories, setSubcategories] = useState<SearchSubcategoryItem[]>([]);

	const { collection, set } = useListCollection<SearchProductItem>({
		initialItems: [],
		itemToString: (item) => item.name,
		itemToValue: (item) => item.name,
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

			if (cache.current.has(inputValue)) {
				const cached = cache.current.get(inputValue)!;

				const isRelevant = cached.products.some((p) =>
					p.name.toLowerCase().includes(inputValue.toLowerCase())
				);

				if (isRelevant) {
					set(cached.products);
					setSubcategories(cached.subcategories);
					setIsLoading(false);
					return;
				}
			}

			try {
				const res = await fetch(`/api/products/search?q=${encodeURIComponent(inputValue)}`);
				const data: SearchResponse = await res.json();
				cache.current.set(inputValue, data);
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
		[inputValue]
	);

	return (
		<Group flex='1' hideBelow={hideBelow} px={{ base: '0px', md: '20px' }} attached>
			<Combobox.Root
				variant='subtle'
				collection={collection}
				size='md'
				openOnChange={(e) => e.inputValue.length > 0}
				onInputValueChange={(e) => setInputValue(e.inputValue)}
				positioning={{ flip: false, gutter: 2 }}
			>
				<Combobox.Control roundedLeft='md' fontSize='sm' minWidth='284px' bg='bg'>
					<Combobox.Input
						placeholder={placeholder}
						_placeholder={{ fontSize: 'sm' }}
						fontSize='sm'
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
							<Combobox.Empty fontSize='15px' fontWeight='medium'>
								{notFound}
							</Combobox.Empty>
						)}

						{hasSearched && !isLoading && collection.items.length > 0 && (
							<>
								<Heading
									fontSize='lg'
									fontWeight='medium'
									my='2'
									borderBottom='1px solid'
									borderColor='border.light'
								>
									<Icon ml='1' mr='2.5'>
										<IoPricetagsOutline />
									</Icon>
									{products}
								</Heading>
								{collection.items.map((item) => (
									<ProductSearchItem key={`product-${item.name}`} item={item} />
								))}

								<SeeAllLink
									linkTo={`/products/search/?searchQuery=${encodeURIComponent(inputValue.trim())}`}
									seeAll={seeAll}
								/>

								{subcategories.length > 0 && (
									<>
										<Heading
											fontSize='lg'
											fontWeight='medium'
											my='2'
											borderBottom='1px solid'
											borderColor='border.light'
										>
											<Icon ml='1' mr='2.5'>
												<IoPricetagsOutline />
											</Icon>
											{categories}
										</Heading>
										<Wrap gap='4' my='3' pl='2'>
											{subcategories.map((item) => (
												<CategorySearchItem key={`category-${item.name}`} item={item} />
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
