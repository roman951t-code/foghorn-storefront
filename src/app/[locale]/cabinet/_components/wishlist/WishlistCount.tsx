'use client';
import { useWishList } from '@/hooks/useWishList';
import { Highlight, Text } from '@chakra-ui/react';

type Props = {
	totalProductsText: string;
	unitsText: string;
};

export default function WishListCount({ totalProductsText, unitsText }: Props) {
	const { ids } = useWishList();

	return (
		<Text>
			<Highlight query='100 шт' styles={{ fontWeight: 'semibold' }}>
				{`${totalProductsText}: ${ids.length} ${unitsText}`}
			</Highlight>
		</Text>
	);
}
