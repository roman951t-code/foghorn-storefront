'use client';
import { Image, useBreakpointValue } from '@chakra-ui/react';
import { Link } from '@/i18n/routing';

const logoBig = '/assets/images/logoBig.webp';
const logoSmall = '/assets/images/logoSmall.webp';

export default function Logo() {
	const logoSrc = useBreakpointValue({
		base: logoSmall,
		sm: logoBig,
		md: logoSmall,
		lg: logoBig,
	});

	return (
		<Link href='/'>
			<Image src={logoSrc} fit='cover' minWidth='36px' h='36px' alt='logo' />
		</Link>
	);
}
