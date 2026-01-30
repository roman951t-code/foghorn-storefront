'use client';

import { Button, HStack, Text, VStack } from '@chakra-ui/react';

type VariantAttr = { name: string; value: string; unit: string | null };
type Variant = {
	id: string;
	stock: number;
	attributes: VariantAttr[];
};

function attrValue(variant: Variant, name: string) {
	return variant.attributes.find((a) => a.name === name)?.value ?? null;
}

function variantMatches(variant: Variant, desired: Record<string, string>) {
	return Object.entries(desired).every(([name, value]) => attrValue(variant, name) === value);
}

export function VariantSelector({
	variants,
	value,
	onChange,
}: {
	variants: Variant[];
	value: string | null;
	onChange: (variantId: string) => void;
}) {
	if (!variants?.length) return null;

	const current =
		( value ? variants.find((v) => v.id === value) : null ) ??
		variants.find((v) => v.stock > 0) ??
		variants[0];

	const attributeNames = Array.from(
		new Set(variants.flatMap((v) => v.attributes.map((a) => a.name)))
	).sort((a, b) => a.localeCompare(b));

	const currentAttrMap: Record<string, string> = {};
	for (const attr of current.attributes) currentAttrMap[attr.name] = attr.value;

	const pickVariant = (attrName: string, nextValue: string) => {
		const desired = { ...currentAttrMap, [attrName]: nextValue };
		const exact =
			variants.find((v) => v.stock > 0 && variantMatches(v, desired)) ??
			variants.find((v) => variantMatches(v, desired));
		if (exact) return exact.id;

		const relaxed =
			variants.find((v) => v.stock > 0 && attrValue(v, attrName) === nextValue) ??
			variants.find((v) => attrValue(v, attrName) === nextValue);
		return relaxed?.id ?? current.id;
	};

	return (
		<VStack alignItems='flex-start' gap='4' w='full' mt='2'>
			{attributeNames.map((attrName) => {
				const values = Array.from(
					new Set(
						variants
							.map((v) => v.attributes.find((a) => a.name === attrName))
							.filter(Boolean)
							.map((a) => a!.value)
					)
				).sort((a, b) => a.localeCompare(b));

				const unit = variants
					.flatMap((v) => v.attributes)
					.find((a) => a.name === attrName)?.unit;

				return (
					<VStack key={attrName} alignItems='flex-start' gap='2' w='full'>
						<Text color='main' fontWeight='medium'>
							{attrName}
							{unit ? `, ${unit}` : ''}
						</Text>
						<HStack gap='2' flexWrap='wrap'>
							{values.map((val) => {
								const desired = { ...currentAttrMap, [attrName]: val };
								const exists = variants.some((v) => variantMatches(v, desired));
								const inStock = variants.some((v) => v.stock > 0 && variantMatches(v, desired));
								const selected = currentAttrMap[attrName] === val;

								return (
									<Button
										key={val}
										type='button'
										size='sm'
										variant={selected ? 'solid' : 'outline'}
										bg={selected ? 'main.secondary' : 'transparent'}
										color={selected ? 'black' : 'main'}
										borderColor={selected ? 'main.secondary' : 'border'}
										_hover={
											selected
												? { bg: 'bgHover.button' }
												: { bg: 'bg.tertiary', borderColor: 'main.secondary' }
										}
										disabled={!exists}
										opacity={!exists ? 0.4 : !inStock ? 0.7 : 1}
										onClick={() => onChange(pickVariant(attrName, val))}
									>
										{val}
									</Button>
								);
							})}
						</HStack>
					</VStack>
				);
			})}
		</VStack>
	);
}
