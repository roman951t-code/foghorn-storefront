'use client';

import { Box, Field, HStack, IconButton, Input, VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useController, type Control, type FieldError } from 'react-hook-form';
import { LuCheck, LuChevronDown, LuX } from 'react-icons/lu';
import type { ShippingAddressFormValue } from '@/utils/shippingAddress';

type CountryOption = { label: string; value: string };

interface CountryFieldProps {
	control: Control<ShippingAddressFormValue>;
	countryItems: CountryOption[];
	countryInputId: string;
	label: string;
	placeholder: string;
	clearSearchLabel: string;
	toggleListLabel: string;
	error?: FieldError;
}

export default function CountryField({
	control,
	countryItems,
	countryInputId,
	label,
	placeholder,
	clearSearchLabel,
	toggleListLabel,
	error,
}: CountryFieldProps) {
	const countryFieldRef = useRef<HTMLDivElement | null>(null);
	const [countrySearchValue, setCountrySearchValue] = useState<string | null>(null);
	const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
	const [highlightedCountryIndex, setHighlightedCountryIndex] = useState(-1);
	const {
		field: { value, onChange, onBlur },
	} = useController({
		control,
		name: 'country',
	});

	const selectedCountry = value || '';
	const listboxId = `${countryInputId}-listbox`;
	const displayedInputValue = countrySearchValue !== null ? countrySearchValue : selectedCountry;
	const hasDisplayedValue = displayedInputValue.length > 0;
	const filteredCountryItems = useMemo(() => {
		const search = (countrySearchValue ?? '').trim().toLowerCase();
		if (!search) return countryItems;
		return countryItems.filter((country) => country.label.toLowerCase().includes(search));
	}, [countryItems, countrySearchValue]);

	useEffect(() => {
		setCountrySearchValue(null);
		setIsCountryDropdownOpen(false);
		setHighlightedCountryIndex(-1);
	}, [countryItems, selectedCountry]);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node | null;
			if (!target || !countryFieldRef.current) return;
			if (!countryFieldRef.current.contains(target)) {
				setCountrySearchValue(null);
				setIsCountryDropdownOpen(false);
				setHighlightedCountryIndex(-1);
			}
		};

		document.addEventListener('mousedown', handleOutsideClick);
		return () => document.removeEventListener('mousedown', handleOutsideClick);
	}, []);

	const openCountryDropdown = () => {
		setCountrySearchValue(null);
		setIsCountryDropdownOpen(true);

		const selectedIndex = countryItems.findIndex((country) => country.value === selectedCountry);
		setHighlightedCountryIndex(selectedIndex >= 0 ? selectedIndex : countryItems.length > 0 ? 0 : -1);
	};

	const closeCountryDropdown = () => {
		setCountrySearchValue(null);
		setIsCountryDropdownOpen(false);
		setHighlightedCountryIndex(-1);
	};

	const selectCountry = (nextCountry: string) => {
		onChange(nextCountry);
		closeCountryDropdown();
	};

	const clearCountry = () => {
		onChange('');
		closeCountryDropdown();
	};

	return (
		<Field.Root required invalid={!!error}>
			<Field.Label htmlFor={countryInputId}>
				{label}
				<Field.RequiredIndicator />
			</Field.Label>
			<VStack alignItems='flex-start' w='full'>
				<Box w='full' position='relative' ref={countryFieldRef}>
					<Input
						id={countryInputId}
						value={displayedInputValue}
						placeholder={placeholder}
						pr='20'
						autoComplete='off'
						role='combobox'
						aria-haspopup='listbox'
						aria-expanded={isCountryDropdownOpen}
						aria-autocomplete='list'
						aria-controls={listboxId}
						aria-activedescendant={
							isCountryDropdownOpen &&
							highlightedCountryIndex >= 0 &&
							filteredCountryItems[highlightedCountryIndex]
								? `${countryInputId}-option-${highlightedCountryIndex}`
								: undefined
						}
						onFocus={openCountryDropdown}
						onClick={() => {
							if (!isCountryDropdownOpen) {
								openCountryDropdown();
							}
						}}
						onChange={(event) => {
							setCountrySearchValue(event.target.value);
							setIsCountryDropdownOpen(true);
							setHighlightedCountryIndex(0);
						}}
						onKeyDown={(event) => {
							if (event.key === 'ArrowDown') {
								event.preventDefault();

								if (!isCountryDropdownOpen) {
									openCountryDropdown();
									return;
								}

								setHighlightedCountryIndex((prev) => {
									if (!filteredCountryItems.length) return -1;
									if (prev < 0) return 0;
									return Math.min(prev + 1, filteredCountryItems.length - 1);
								});
								return;
							}

							if (event.key === 'ArrowUp') {
								event.preventDefault();
								if (!isCountryDropdownOpen || !filteredCountryItems.length) return;
								setHighlightedCountryIndex((prev) => (prev <= 0 ? 0 : prev - 1));
								return;
							}

							if (event.key === 'Enter') {
								if (
									!isCountryDropdownOpen ||
									highlightedCountryIndex < 0 ||
									!filteredCountryItems[highlightedCountryIndex]
								) {
									return;
								}

								event.preventDefault();
								selectCountry(filteredCountryItems[highlightedCountryIndex].value);
								return;
							}

							if (event.key === 'Escape') {
								event.preventDefault();
								closeCountryDropdown();
							}
						}}
						onBlur={(event) => {
							onBlur();
							const nextTarget = event.relatedTarget as Node | null;
							if (nextTarget && countryFieldRef.current?.contains(nextTarget)) {
								return;
							}
							closeCountryDropdown();
						}}
					/>
					<HStack
						position='absolute'
						top='50%'
						right='2'
						transform='translateY(-50%)'
						gap='1'
					>
						<IconButton
							type='button'
							aria-label={clearSearchLabel}
							variant='ghost'
							size='xs'
							minW='6'
							h='6'
							visibility={hasDisplayedValue ? 'visible' : 'hidden'}
							disabled={!hasDisplayedValue}
							onMouseDown={(event) => event.preventDefault()}
							onClick={clearCountry}
						>
							<LuX />
						</IconButton>
						<IconButton
							type='button'
							aria-label={toggleListLabel}
							variant='ghost'
							size='xs'
							minW='6'
							h='6'
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => {
								if (isCountryDropdownOpen) {
									closeCountryDropdown();
									return;
								}
								openCountryDropdown();
							}}
						>
							<LuChevronDown />
						</IconButton>
					</HStack>
					{isCountryDropdownOpen && (
						<Box
							id={listboxId}
							position='absolute'
							top='calc(100% + 4px)'
							left='0'
							right='0'
							zIndex={1500}
							bg='bg.tertiary'
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							borderRadius='md'
							maxH='260px'
							overflowY='auto'
							role='listbox'
							aria-label={label}
						>
							{filteredCountryItems.map((country, index) => {
								const isSelected = country.value === selectedCountry;
								const isHighlighted = index === highlightedCountryIndex;

								return (
									<Box
										id={`${countryInputId}-option-${index}`}
										key={country.value}
										px='3'
										py='2'
										cursor='pointer'
										display='flex'
										alignItems='center'
										justifyContent='space-between'
										bg={isHighlighted ? 'bg.muted' : 'transparent'}
										_hover={{ bg: 'bg.muted' }}
										role='option'
										aria-selected={isSelected}
										onMouseEnter={() => setHighlightedCountryIndex(index)}
										onMouseDown={(event) => {
											event.preventDefault();
											selectCountry(country.value);
										}}
									>
										{country.label}
										{isSelected ? <LuCheck /> : null}
									</Box>
								);
							})}
						</Box>
					)}
				</Box>
				<Field.ErrorText>{error?.message?.toString()}</Field.ErrorText>
			</VStack>
		</Field.Root>
	);
}
