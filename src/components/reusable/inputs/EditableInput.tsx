import { Editable, IconButton } from '@chakra-ui/react';
import { LuCheck, LuPencilLine, LuX } from 'react-icons/lu';

interface Props {
	defaultValue: string;
	onSubmit: (value: string) => void;
}
export default function EditableInput({ defaultValue, onSubmit }: Props) {
	return (
		<Editable.Root defaultValue={defaultValue} onSubmit={onSubmit}>
			<Editable.Preview textStyle='md' minW='110px' />
			<Editable.Input
				textAlign='left'
				minW='180px'
				maxW='220px'
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
					<IconButton variant='ghost' size='xs' color='main' bg='bg' rounded='full' ml='2'>
						<LuPencilLine />
					</IconButton>
				</Editable.EditTrigger>
				<Editable.CancelTrigger asChild>
					<IconButton variant='ghost' size='xs' color='main' bg='bg' rounded='full'>
						<LuX />
					</IconButton>
				</Editable.CancelTrigger>
				<Editable.SubmitTrigger asChild>
					<IconButton variant='ghost' size='xs' color='main' bg='bg' rounded='full'>
						<LuCheck />
					</IconButton>
				</Editable.SubmitTrigger>
			</Editable.Control>
		</Editable.Root>
	);
}
