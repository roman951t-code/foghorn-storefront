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
// fixed 42px height, not reused across variants — they aren't identical
// aspect ratios, and an off-ratio width/height pair makes next/image warn
// about a distorted image.
export default function Logo() {
	return (
		<Link href='/' aria-label='Go to homepage'>
			<Box hideFrom='md'>
				<Box _dark={{ display: 'none' }}>
					<Image src={ASSET_IMAGES.logoSmallDark} alt='logo' width={48} height={48} priority />
				</Box>
				<Box display='none' _dark={{ display: 'block' }}>
					<Image src={ASSET_IMAGES.logoSmallLight} alt='logo' width={48} height={48} priority />
				</Box>
			</Box>
			<Box hideBelow='md'>
				<Box _dark={{ display: 'none' }}>
					<Image src={ASSET_IMAGES.logoBigDark} alt='logo' width={208} height={50} priority />
				</Box>
				<Box display='none' _dark={{ display: 'block' }}>
					<Image src={ASSET_IMAGES.logoBigLight} alt='logo' width={208} height={50} priority />
				</Box>
			</Box>
		</Link>
	);
}
