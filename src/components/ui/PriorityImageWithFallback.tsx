'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Props = {
	src: string;
	fallbackSrc: string;
	alt: string;
	sizes: string;
	objectFit?: 'cover' | 'contain';
	loading?: 'eager' | 'lazy';
	fetchPriority?: 'high' | 'low' | 'auto';
	priority?: boolean;
};

export default function PriorityImageWithFallback({
	src,
	fallbackSrc,
	alt,
	sizes,
	objectFit = 'cover',
	loading = 'lazy',
	fetchPriority,
	priority = false,
}: Props) {
	const [resolvedSrc, setResolvedSrc] = useState(src);

	useEffect(() => {
		setResolvedSrc(src);
	}, [src]);

	return (
		<Image
			src={resolvedSrc}
			alt={alt}
			fill
			sizes={sizes}
			priority={priority}
			loading={loading}
			fetchPriority={fetchPriority}
			style={{ objectFit }}
			onError={() => {
				if (resolvedSrc !== fallbackSrc) {
					setResolvedSrc(fallbackSrc);
				}
			}}
		/>
	);
}
