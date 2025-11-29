import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
} from '@/components/ui/chakra/dialog';
import { Image } from '@chakra-ui/react';

interface Props {
	image: string | null;
	resetModal: () => void;
}
export default function ImageModal({ image, resetModal }: Props) {
	const ids = {
		trigger: 'image-modal-trigger',
		content: 'image-modal-content',
		title: 'image-modal-title',
		description: 'image-modal-description',
	};

	return (
		<DialogRoot
			ids={ids}
			open={!!image}
			placement='center'
			size='cover'
			onInteractOutside={resetModal}
			onEscapeKeyDown={resetModal}
		>
			<DialogContent maxW='1000px' maxH='1100px'>
				<DialogBody>
					{image && (
						<Image
							height='100%'
							margin='auto'
							maxHeight='90vh'
							marginLeft='auto'
							marginRight='auto'
							src={image}
							alt='Expanded product photo'
							objectFit='contain'
						/>
					)}
				</DialogBody>

				<DialogCloseTrigger
					onClick={resetModal}
					_focus={{ outline: 'none' }}
					borderColor={{ _hover: 'border' }}
				/>
			</DialogContent>
		</DialogRoot>
	);
}
