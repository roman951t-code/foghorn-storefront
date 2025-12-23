'use client';
import { useBreakpointValue } from '@chakra-ui/react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ASSET_IMAGES } from '@/constants/assets';

export default function Logo() {
	const logoSrc =
		useBreakpointValue({
			base: ASSET_IMAGES.logoSmall,
			md: ASSET_IMAGES.logoBig,
			lg: ASSET_IMAGES.logoBig,
		}) || ASSET_IMAGES.logoBig;

	const logoWidth =
		useBreakpointValue({
			base: 36,
			sm: 36,
			md: 170,
			lg: 170,
		}) || 170;

	const logoHeight = 36;

	return (
		<Link href='/' aria-label='Go to homepage'>
			<Image
				src={logoSrc}
				alt='logo'
				width={logoWidth}
				height={logoHeight}
				style={{ width: 'auto' }}
				priority
			/>
		</Link>
	);
}
