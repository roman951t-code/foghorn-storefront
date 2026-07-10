'use client';

import PriorityImageWithFallback from '@/components/ui/PriorityImageWithFallback';
import { SUBCATEGORY_PLACEHOLDER_IMAGE } from '@/utils/categoryImages';

type Props = {
	src: string;
	alt: string;
	priority?: boolean;
};

export default function CategoryCardImage({ src, alt, priority = false }: Props) {
	return (
		<PriorityImageWithFallback
			src={src}
			fallbackSrc={SUBCATEGORY_PLACEHOLDER_IMAGE}
			alt={alt}
			// Matches CategoryCards.tsx's grid column counts (1/2/3/4 at
			// base/cardSm/md/xl) instead of the old fixed-width Wrap layout.
			sizes='(min-width: 1200px) 25vw, (min-width: 768px) 33vw, (min-width: 532px) 50vw, 100vw'
			objectFit='cover'
			loading={priority ? 'eager' : 'lazy'}
			fetchPriority={priority ? 'high' : 'auto'}
			priority={priority}
		/>
	);
}
