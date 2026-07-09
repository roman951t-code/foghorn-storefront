import { Heading, HStack, Box, type HeadingProps } from '@chakra-ui/react';

const ACCENT = { base: 'orange.400', _dark: 'yellow.400' };
const BAR_HEIGHT: Record<string, string> = {
	'2xl': '26px',
	'3xl': '32px',
};

type Props = HeadingProps & {
	size?: '2xl' | '3xl';
};

// Shared h1 treatment for every storefront page (category/subcategory
// listings, checkout, info pages, search) — a colored accent bar next to a
// bold heading, matching the same accent-bar language already used for the
// active category in CatalogPanel and the filter-sidebar section headings.
export default function PageHeading({ size = '3xl', children, ...rest }: Props) {
	return (
		<HStack gap={3} align='center' w={rest.w}>
			<Box w='5px' h={BAR_HEIGHT[size]} rounded='full' bg={ACCENT} flexShrink={0} />
			<Heading as='h1' size={size} fontWeight='semibold' {...rest}>
				{children}
			</Heading>
		</HStack>
	);
}
