import { IconButton } from '@chakra-ui/react';
import { FiArrowUp } from 'react-icons/fi';

export default function ToTop() {
	return (
		<IconButton
			position='fixed'
			zIndex='100'
			bottom='120px'
			right='30px'
			aria-label='Back to Top'
			variant='ghost'
			color='baccent'
			size='md'
			rounded='full'
			border='2px solid'
			borderColor='accent'
			bg={{ base: 'transparent' }}
			transition='all 0.3s ease-in-out'
			_hover={{
				bg: 'accent',
				color: 'bg',
			}}
		>
			<FiArrowUp />
		</IconButton>
	);
}
