'use client';

import { Heading, Stack } from '@chakra-ui/react';
import { notFound } from 'next/navigation';
import CategorySlider from './CategorySlider';
import { useCatalog } from '@/components/providers/CatalogProvider';

type Props = {
	slug: string;
};

export default function CategoryClient({ slug }: Props) {
	const { categories } = useCatalog();
	const category = categories.find((cat) => cat.slug === slug);

	if (!category) {
		notFound();
	}

	return (
		<Stack gap='6'>
			<Heading as='h1' size='3xl' fontWeight='medium'>
				{category.name}
			</Heading>

			<CategorySlider category={category} />
		</Stack>
	);
}
