import { Box } from '@chakra-ui/react';
import Image from 'next/image';
import { ASSET_IMAGES } from '@/constants/assets';

type EmptyCartImageProps = {
	size: number;
	alt?: string;
};

// Two images swapped via CSS (_dark), not a colorMode check, so the right
// variant shows from first paint instead of flashing light-then-dark after
// hydration (see Logo.tsx for the same reasoning applied to responsive size).
export default function EmptyCartImage({ size, alt = 'empty cart' }: EmptyCartImageProps) {
	return (
		<>
			<Box display={{ base: 'block', _dark: 'none' }}>
				<Image src={ASSET_IMAGES.emptyCartLight} width={size} height={size} alt={alt} />
			</Box>
			<Box display={{ base: 'none', _dark: 'block' }}>
				<Image src={ASSET_IMAGES.emptyCartDark} width={size} height={size} alt={alt} />
			</Box>
		</>
	);
}
