'use client';

import { Box } from '@chakra-ui/react';
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
} from '@/components/ui/chakra/dialog';
import { IMAGE_MODAL_DIALOG_IDS } from '@/constants/dialogs';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/utils/productImages';
import Image from 'next/image';
import { Keyboard, Navigation, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

interface Props {
	images: string[];
	initialIndex: number | null;
	productName?: string;
	resetModal: () => void;
}
export default function ImageModal({ images, initialIndex, productName, resetModal }: Props) {
	const isOpen = initialIndex !== null;
	const normalizedImages = images.filter((src): src is string => src.trim().length > 0);
	const galleryImages = normalizedImages.length ? normalizedImages : [PRODUCT_PLACEHOLDER_IMAGE];
	const requestedIndex = Number.isFinite(initialIndex)
		? Math.max(0, Math.floor(initialIndex ?? 0))
		: 0;
	const safeInitialIndex = Math.min(requestedIndex, Math.max(0, galleryImages.length - 1));
	const modalGalleryKey = `${galleryImages.join('|')}::${safeInitialIndex}`;
	const accessibleName = productName ?? 'product';
	const canNavigate = galleryImages.length > 1;

	return (
		<DialogRoot
			ids={IMAGE_MODAL_DIALOG_IDS}
			open={isOpen}
			placement='center'
			size='cover'
			onInteractOutside={resetModal}
			onEscapeKeyDown={resetModal}
		>
			<DialogContent maxW='1100px' maxH='96vh' w='100%'>
				<DialogBody p={{ base: 2, md: 4 }}>
					{isOpen && (
						<Swiper
							key={modalGalleryKey}
							initialSlide={safeInitialIndex}
							loop={canNavigate}
							navigation={canNavigate}
							grabCursor={canNavigate}
							keyboard={{ enabled: true, onlyInViewport: false }}
							a11y={{
								enabled: true,
								containerMessage: `Expanded gallery for ${accessibleName}`,
								itemRoleDescriptionMessage: 'Slide',
								slideLabelMessage: 'Image {{index}} of {{slidesLength}}',
								prevSlideMessage: 'Previous product image',
								nextSlideMessage: 'Next product image',
							}}
							modules={[Navigation, Keyboard, A11y]}
							className='imageModalSwiper'
							aria-label={`Expanded gallery for ${accessibleName}`}
						>
							{galleryImages.map((src, index) => (
								<SwiperSlide key={`${src}-${index}`}>
									<Box position='relative' width='100%' height={{ base: '72vh', md: '84vh' }}>
										<Image
											src={src}
											alt={`${accessibleName} expanded image ${index + 1}`}
											fill
											priority={index === safeInitialIndex}
											style={{ objectFit: 'contain' }}
											sizes='(max-width: 768px) 92vw, 1100px'
										/>
									</Box>
								</SwiperSlide>
							))}
						</Swiper>
					)}
				</DialogBody>

				<DialogCloseTrigger
					onClick={resetModal}
					zIndex='2'
					_focusVisible={{
						outline: '2px solid',
						outlineColor: 'main.secondary',
						outlineOffset: '2px',
					}}
					borderColor={{ _hover: 'border' }}
				/>
			</DialogContent>
		</DialogRoot>
	);
}
