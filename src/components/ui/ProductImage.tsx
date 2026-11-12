'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { PRODUCT_PLACEHOLDER_IMAGE, resolveProductPrimaryImage } from '@/utils/productImages';
import { shouldBypassImageOptimization } from '@/utils/imageOptimization';

/** Local fallback also covers carts, order history and the expanded gallery. */
export default function ProductImage({ src, alt, onError, ...props }: Omit<ImageProps, 'src'> & { src: string }) {
	const primary = resolveProductPrimaryImage(src);
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	const resolvedSrc = failedSrc === primary ? PRODUCT_PLACEHOLDER_IMAGE : primary;
	return (
		<Image
			{...props}
			alt={alt}
			src={resolvedSrc}
			unoptimized={shouldBypassImageOptimization(resolvedSrc)}
			onError={(event) => {
				if (resolvedSrc === PRODUCT_PLACEHOLDER_IMAGE) return;
				setFailedSrc(primary);
				onError?.(event);
			}}
		/>
	);
}
