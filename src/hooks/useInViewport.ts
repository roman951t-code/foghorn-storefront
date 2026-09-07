'use client';

import { useEffect, useRef, useState } from 'react';

// Fires once when the element comes within `rootMargin` of the viewport,
// then disconnects — callers just need "has this scrolled near yet," not
// repeated in/out toggling.
export function useInViewport<T extends Element>(rootMargin = '600px') {
	const ref = useRef<T>(null);
	const [isInViewport, setIsInViewport] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node || isInViewport) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInViewport(true);
					observer.disconnect();
				}
			},
			{ rootMargin },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [isInViewport, rootMargin]);

	return { ref, isInViewport };
}
