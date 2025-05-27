import { Input, IconButton, Group } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

interface Props {
	placeholder: string;
	hideBelow?: string;
}

export default function SearchInput({ placeholder, hideBelow }: Props) {
	return (
		<Group flex='1' hideBelow={hideBelow} px={{ base: '0px', md: '20px' }} attached>
			<Input
				rounded='md'
				placeholder={placeholder}
				size='md'
				variant='subtle'
				fontSize='sm'
				minWidth='284px'
				bg='bg'
				_placeholder={{ fontSize: 'sm' }}
				_focus={{
					border: '2px solid',
					borderColor: 'main.secondary',
					outline: 'none',
				}}
			/>
			<IconButton
				aria-label='Search'
				rounded='md'
				size='md'
				color='main.darkOnly'
				width='44px'
				bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
			>
				<FiSearch />
			</IconButton>
		</Group>
	);
}
