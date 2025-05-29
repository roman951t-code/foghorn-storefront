import { DialogBody, DialogCloseTrigger, DialogContent, DialogRoot } from '@/components/ui/dialog';
import Image from 'next/image';

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
					{image && (
						<Image
							style={{
								height: '100%',
								margin: 'auto',
								maxHeight: '90vh',
								marginLeft: 'auto',
								marginRight: 'auto',
							}}
							src={image}
							alt='Expanded product photo'
							objectFit='contain'
						/>
					)}
				</DialogBody>
				<DialogCloseTrigger onClick={resetModal} borderColor={{ _hover: 'border' }} />
			</DialogContent>
		</DialogRoot>
	);
}
