'use client';

import { Box, IconButton } from '@chakra-ui/react';
import { LuArrowUp } from 'react-icons/lu';
import { useEffect, useState } from 'react';

const VISIBILITY_OFFSET = 640;

export default function ToTop() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		let frameId: number | null = null;

		const updateState = () => {
			const currentY = window.scrollY;

			setIsVisible(currentY > VISIBILITY_OFFSET);
			frameId = null;
		};

		const onViewportChange = () => {
			if (frameId !== null) return;
			frameId = window.requestAnimationFrame(updateState);
		};

		updateState();
		window.addEventListener('scroll', onViewportChange, { passive: true });
		window.addEventListener('resize', onViewportChange);

		return () => {
			if (frameId !== null) {
				window.cancelAnimationFrame(frameId);
			}
			window.removeEventListener('scroll', onViewportChange);
			window.removeEventListener('resize', onViewportChange);
		};
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	return (
		<Box
			position='fixed'
			zIndex='100'
			bottom={{
				base: 'calc(104px + env(safe-area-inset-bottom))',
				md: 'calc(72px + env(safe-area-inset-bottom))',
			}}
			right={{ base: '16px', md: '24px' }}
			opacity={isVisible ? 1 : 0}
			pointerEvents={isVisible ? 'auto' : 'none'}
			transition='opacity 0.2s ease, transform 0.2s ease'
		>
			<Box p='2px' rounded='full'>
				<IconButton
					onClick={scrollToTop}
					aria-label='Back to top'
					size='lg'
					rounded='full'
					borderWidth='1.5px'
					borderStyle='solid'
					borderColor='border.button'
					bg='bg.tertiary'
					color='main'
					backdropFilter='blur(8px)'
					transition='all 0.22s ease-in-out'
					_hover={{
						bg: 'bgHover.promoCard',
						transform: 'translateY(-1px)',
					}}
					_active={{ transform: 'translateY(0)' }}
					_focusVisible={{
						outline: '1px solid',
						outlineColor: 'main.secondary',
						outlineOffset: '2px',
					}}
				>
					<LuArrowUp />
				</IconButton>
			</Box>
		</Box>
	);
}
