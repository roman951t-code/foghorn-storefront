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
			sizes='(min-width: 30em) 316px, 100vw'
			objectFit='cover'
			loading={priority ? 'eager' : 'lazy'}
			fetchPriority={priority ? 'high' : 'auto'}
			priority={priority}
		/>
	);
}
