import { Box } from '@chakra-ui/react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ASSET_IMAGES } from '@/constants/assets';

// Renders both sizes and toggles visibility with CSS (hideFrom/hideBelow)
// instead of picking one via useBreakpointValue. That hook doesn't know the
// real viewport during SSR/first paint, so it fell back to the desktop
// logo image, then swapped to the small one after hydration on mobile — a
// visible resize. CSS picks the right one from the first paint, no
// post-hydration swap. The light/dark variant is picked the same way, via
// _dark, since the color-mode class is also applied pre-paint (see
// ColorModeProvider) — a JS check would only know the stored preference
// after hydration, causing the same kind of flash.
//
// Each variant's width is derived from its own real pixel dimensions at a
// fixed height, not reused across variants — they aren't identical aspect
// ratios, and an off-ratio width/height pair makes next/image warn about a
// distorted image (logo_small.png is 92x88, logo_big.png is 380x83 —
// neither is square/round-numbered, so the width below isn't either).
export default function Logo() {
	return (
		<Link href='/' aria-label='Go to homepage'>
			<Box hideFrom='md'>
				<Box>
					<Image src={ASSET_IMAGES.logoSmall} alt='logo' width={50} height={48} priority />
				</Box>
			</Box>
			<Box hideBelow='md'>
				<Box>
					<Image src={ASSET_IMAGES.logoBig} alt='logo' width={210} height={50} priority />
				</Box>
			</Box>
		</Link>
	);
}
