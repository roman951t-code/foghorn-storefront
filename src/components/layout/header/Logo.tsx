import { Box } from '@chakra-ui/react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ASSET_IMAGES } from '@/constants/assets';

// Renders both sizes and toggles visibility with CSS (hideFrom/hideBelow)
// instead of picking one via useBreakpointValue. That hook doesn't know the
// real viewport during SSR/first paint, so it fell back to the desktop
// logo image, then swapped to the small one after hydration on mobile — a
// visible resize. CSS picks the right one from the first paint, no
// post-hydration swap.
//
// logoBig.webp's real dimensions are 210x40 (5.25:1). At the header's fixed
// 36px row height that's 189x36 — not 170x36, which is a slightly different
// ratio and was making next/image warn about a distorted aspect ratio.
export default function Logo() {
	return (
		<Link href='/' aria-label='Go to homepage'>
			<Box hideFrom='md'>
				<Image src={ASSET_IMAGES.logoSmall} alt='logo' width={36} height={36} priority />
			</Box>
			<Box hideBelow='md'>
				<Image src={ASSET_IMAGES.logoBig} alt='logo' width={189} height={36} priority />
			</Box>
		</Link>
	);
}
