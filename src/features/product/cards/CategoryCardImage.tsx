'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SUBCATEGORY_PLACEHOLDER_IMAGE } from '@/utils/categoryImages';

type Props = {
	src: string;
	alt: string;
};

export default function CategoryCardImage({ src, alt }: Props) {
	const [resolvedImageUrl, setResolvedImageUrl] = useState(src);

	useEffect(() => {
		setResolvedImageUrl(src);
	}, [src]);

	return (
		<Image
			src={resolvedImageUrl}
			alt={alt}
			fill
			sizes='(min-width: 30em) 316px, 100vw'
			loading='lazy'
			style={{ objectFit: 'cover' }}
			onError={() => {
				if (resolvedImageUrl !== SUBCATEGORY_PLACEHOLDER_IMAGE) {
					setResolvedImageUrl(SUBCATEGORY_PLACEHOLDER_IMAGE);
				}
			}}
		/>
	);
}
