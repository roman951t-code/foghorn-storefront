import { Image } from '@chakra-ui/react';
import { DialogBody, DialogCloseTrigger, DialogContent, DialogRoot } from '@/components/ui/dialog';

interface Props {
	image: string | null;
	resetModal: () => void;
}
export default function ImageModal({ image, resetModal }: Props) {
	return (
		<DialogRoot
			open={!!image}
			placement='center'
			size='cover'
			onInteractOutside={resetModal}
			onEscapeKeyDown={resetModal}
		>
			<DialogContent maxW='1000px' maxH='1100px'>
				<DialogBody>
					<Image
						src={image!}
						alt='Expanded product photo'
						h='100%'
						mx='auto'
						maxH='90vh'
						objectFit='contain'
					/>
				</DialogBody>
				<DialogCloseTrigger onClick={resetModal} borderColor={{ _hover: 'border' }} />
			</DialogContent>
		</DialogRoot>
	);
}
