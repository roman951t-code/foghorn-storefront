import { Box, HStack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export const FILTER_ACCENT = { base: 'orange.400', _dark: 'yellow.400' };

// Small "eyebrow" heading — a colored accent bar + bold label — reused for
// every filter-sidebar section (sort, availability, price) so they read as
// distinct blocks rather than blending into the sidebar's own bg.tertiary
// background. Mirrors the same accent-bar treatment CatalogPanel's category
// sidebar uses for its active item, so the two side-by-side sidebars on the
// subcategory page read as one family.
export default function FilterSectionHeading({ children }: { children: ReactNode }) {
	return (
		<HStack gap={2} mb={3}>
			<Box w='4px' h='16px' rounded='full' bg={FILTER_ACCENT} />
			<Text
				fontSize='xs'
				fontWeight='bold'
				letterSpacing='wide'
				textTransform='uppercase'
				color='main'
			>
				{children}
			</Text>
		</HStack>
	);
}
