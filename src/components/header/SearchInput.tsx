'use client';

import {
	IconButton,
	Group,
	Combobox,
	Highlight,
	useFilter,
	useListCollection,
	useComboboxContext,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

const frameworks = [
	{ label: 'React', value: 'react' },
	{ label: 'Solid', value: 'solid' },
	{ label: 'Vue', value: 'vue' },
	{ label: 'Angular', value: 'angular' },
	{ label: 'Svelte', value: 'svelte' },
	{ label: 'Preact', value: 'preact' },
	{ label: 'Qwik', value: 'qwik' },
	{ label: 'Lit', value: 'lit' },
	{ label: 'Alpine.js', value: 'alpinejs' },
	{ label: 'Ember', value: 'ember' },
	{ label: 'Next.js', value: 'nextjs' },
];

function ComboboxItem(props: { item: { label: string; value: string } }) {
	const { item } = props;
	const combobox = useComboboxContext();
	return (
		<Combobox.Item item={item} key={item.value} fontSize='md' py='2'>
			<Combobox.ItemText _hover={{ cursor: 'pointer' }}>
				<Highlight
					ignoreCase
					query={combobox.inputValue}
					styles={{ bg: 'yellow.emphasized', fontWeight: 'medium' }}
				>
					{item.label}
				</Highlight>
			</Combobox.ItemText>
		</Combobox.Item>
	);
}

interface Props {
	placeholder: string;
	notFound: string;
	hideBelow?: string;
}

export default function SearchInput({ placeholder, hideBelow, notFound }: Props) {
	const { contains } = useFilter({ sensitivity: 'base' });

	const { collection, filter } = useListCollection({
		initialItems: frameworks,
		filter: contains,
	});

	return (
		<Group flex='1' hideBelow={hideBelow} px={{ base: '0px', md: '20px' }} attached>
			<Combobox.Root
				openOnClick
				variant='subtle'
				collection={collection}
				onInputValueChange={(e) => filter(e.inputValue)}
				openOnChange={(e) => e.inputValue.length > 2}
				positioning={{ flip: false, gutter: 2 }}
				size='md'
			>
				<Combobox.Control roundedLeft='md' fontSize='sm' minWidth='284px' bg='bg'>
					<Combobox.Input
						fontSize='md'
						roundedRight='0'
						placeholder={placeholder}
						_placeholder={{ fontSize: 'sm' }}
						_focus={{
							border: '1px solid',
							borderColor: 'main.secondary',
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
						_open={{ animationStyle: 'scale-fade-in' }}
						_closed={{
							animationStyle: 'scale-fade-out',
							animationDuration: 'fast',
						}}
					>
						<Combobox.Empty>{notFound}</Combobox.Empty>
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
