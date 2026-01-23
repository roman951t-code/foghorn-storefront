import { useState, type MouseEvent } from 'react';
import { type ActionProps, OriginalShow, useTranslation } from 'adminjs';
import { Box, Modal, Text } from '@adminjs/design-system';

export default function ProductShow(props: ActionProps) {
	const { record } = props;
	const { translateMessage } = useTranslation();
	const name = String(record?.params?.name ?? '');
	const imageUrl = (record?.params?.imageUrl as string | null | undefined) ?? null;
	const status = String(record?.params?.status ?? '');
	const [isOpen, setIsOpen] = useState(false);

	const openImage = (e?: MouseEvent) => {
		if (e) e.stopPropagation();
		if (!imageUrl) return;
		setIsOpen(true);
	};

	return (
		<Box>
			{isOpen && imageUrl ? (
				<Modal
					onClose={() => setIsOpen(false)}
					onOverlayClick={() => setIsOpen(false)}
					style={{
						width: '92vw',
						maxWidth: 980,
						padding: 24,
						paddingTop: 48,
					}}
				>
					<img
						src={imageUrl}
						alt={translateMessage('product-image-modal-alt')}
						style={{
							width: '100%',
							height: 'auto',
							maxHeight: '78vh',
							objectFit: 'contain',
							borderRadius: 12,
							background: '#F8FAFC',
							display: 'block',
						}}
					/>
				</Modal>
			) : null}

			<Box
				variant='white'
				p='xxl'
				borderRadius='xl'
				boxShadow='sm'
				mb='xl'
				style={{ border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 16 }}
			>
				<Box
					style={{
						width: 160,
						height: 160,
						borderRadius: 18,
						border: '1px solid #E2E8F0',
						background: '#F8FAFC',
						overflow: 'hidden',
						flexShrink: 0,
					}}
				>
					{imageUrl ? (
						<button
							type='button'
							onClick={openImage}
							style={{
								all: 'unset',
								cursor: 'pointer',
								display: 'block',
								width: '100%',
								height: '100%',
							}}
							aria-label={translateMessage('product-image-modal-open')}
						>
							<img
								src={imageUrl}
								alt=''
								style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
								loading='lazy'
							/>
						</button>
					) : null}
				</Box>
				<Box style={{ minWidth: 0 }}>
					<Text
						fontWeight='bold'
						fontSize='xl'
						style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
					>
						{name || 'Product'}
					</Text>
					{status ? <Text color='grey60'>{status}</Text> : null}
				</Box>
			</Box>

			<OriginalShow {...props} />
		</Box>
	);
}
