import { Editable, IconButton } from '@chakra-ui/react';
import { LuCheck, LuPencilLine, LuX } from 'react-icons/lu';

interface Props {
	defaultValue: string;
	onSubmit: (value: string) => void;
}
export default function EditableInput({ defaultValue, onSubmit }: Props) {
	return (
		<Editable.Root
			defaultValue={defaultValue}
			onValueCommit={(details) => onSubmit(details.value)}
		>
			<Editable.Preview textStyle='md' minW='110px' />
			<Editable.Input
				textAlign='left'
				aria-label='Editable field input'
				flex='1'
				rounded='md'
				fontSize='md'
				color='text'
				bg='bg'
				_placeholder={{ fontSize: 'md' }}
				_focus={{
					border: '1px solid',
					borderColor: 'main',
					outline: 'none',
				}}
			/>
			<Editable.Control>
				<Editable.EditTrigger asChild>
					<IconButton
						variant='ghost'
						size='xs'
						color='main'
						bg='bg'
						rounded='full'
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
						rounded='full'
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
						rounded='full'
						aria-label='Save value'
					>
						<LuCheck />
					</IconButton>
				</Editable.SubmitTrigger>
			</Editable.Control>
		</Editable.Root>
	);
}
