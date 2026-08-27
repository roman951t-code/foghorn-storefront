'use client';

import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useIsNavPending } from '@/stores/navProgressStore';

// Top-of-viewport indeterminate progress bar. Renders whenever any link or
// programmatic navigation has bumped the shared nav-progress counter above
// zero. Slight delay before showing prevents a flicker for cache-hit
// navigations that resolve within a few frames.
export default function NavigationProgressBar() {
	const isPending = useIsNavPending();
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (!isPending) {
			setIsVisible(false);
			return;
		}
		// Skip flashing the bar for instant (cached) transitions.
		const timeoutId = window.setTimeout(() => setIsVisible(true), 80);
		return () => window.clearTimeout(timeoutId);
	}, [isPending]);

	return (
		<Box
			position='fixed'
			top='0'
			left='0'
			right='0'
			height='4px'
			zIndex='banner'
			pointerEvents='none'
			opacity={isVisible ? 1 : 0}
			transition='opacity 120ms ease-out'
			aria-hidden='true'
		>
			{/* Faint full-width track so the bar reads as "something is loading"
			    across the whole top edge, not just wherever the sliding highlight
			    currently is — the highlight alone was too easy to miss. */}
			<Box position='absolute' inset='0' bg='main.secondary' opacity={0.25} />
			<Box
				position='absolute'
				top='0'
				left='0'
				height='100%'
				width='30%'
				bg='main.secondary'
				boxShadow='0 0 8px 1px {colors.main.secondary}, 0 0 2px {colors.main.secondary}'
				css={{
					animationName: 'nav-progress-slide',
					animationDuration: '1.1s',
					animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
					animationIterationCount: 'infinite',
					'@keyframes nav-progress-slide': {
						'0%': { transform: 'translateX(-100%)' },
						'100%': { transform: 'translateX(433%)' },
					},
				}}
			/>
		</Box>
	);
}
