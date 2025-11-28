'use client';

import { IconButton } from '@chakra-ui/react';
import { FiArrowUp } from 'react-icons/fi';
import { useEffect, useState } from 'react';

export default function ToTop() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			if (window.scrollY > 1200) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		window.addEventListener('scroll', toggleVisibility);
		return () => window.removeEventListener('scroll', toggleVisibility);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	if (!isVisible) return null;

	return (
		<IconButton
			onClick={scrollToTop}
			position='fixed'
			zIndex='100'
			bottom='118px'
			right='24px'
			aria-label='Back to Top'
			size='md'
			rounded='full'
			border='2px solid'
			bg='bg.primary'
			transition='all 0.3s ease-in-out'
			color='main'
			variant='outline'
			borderColor='border'
		>
			<FiArrowUp />
		</IconButton>
	);
}
