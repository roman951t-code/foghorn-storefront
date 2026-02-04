import { Editable, IconButton } from '@chakra-ui/react';
import { LuCheck, LuPencilLine, LuX } from 'react-icons/lu';

const storefrontInputFocusStyles = {
	borderWidth: '0.5px',
	borderStyle: 'solid',
	borderColor: { base: 'orange', _dark: 'yellow' },
	outline: 'none',
	boxShadow: 'none',
} as const;

interface Props {
	defaultValue: string;
	onSubmit: (value: string) => void;
}
export default function EditableInput({ defaultValue, onSubmit }: Props) {
	return (
		<Editable.Root defaultValue={defaultValue} onValueCommit={(details) => onSubmit(details.value)}>
			<Editable.Preview textStyle='md' minW='110px' />
			<Editable.Input
				textAlign='left'
				aria-label='Editable field input'
				flex='1'
					rounded='lg'
					fontSize='md'
					color='text'
					borderWidth='0.5px'
					borderColor='border'
					_placeholder={{ fontSize: 'md' }}
					focusVisibleRing='none'
				_focus={storefrontInputFocusStyles}
				_focusVisible={storefrontInputFocusStyles}
			/>
			<Editable.Control>
				<Editable.EditTrigger asChild>
					<IconButton
						variant='ghost'
						size='xs'
						color='main'
						bg='bg'
						rounded='md'
						ml='2'
						aria-label='Edit value'
					>
						<LuPencilLine />
					</IconButton>
				</Editable.EditTrigger>
				<Editable.CancelTrigger asChild>
					<IconButton
						variant='ghost'
						size='xs'
						color='main'
						bg='bg'
						rounded='md'
						aria-label='Cancel editing'
					>
						<LuX />
					</IconButton>
				</Editable.CancelTrigger>
				<Editable.SubmitTrigger asChild>
					<IconButton
						variant='ghost'
						size='xs'
						color='main'
						bg='bg'
						rounded='md'
						aria-label='Save value'
					>
						<LuCheck />
					</IconButton>
				</Editable.SubmitTrigger>
			</Editable.Control>
		</Editable.Root>
	);
}
