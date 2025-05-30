'use client';
import { useBreakpointValue } from '@chakra-ui/react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

const logoBig = '/assets/images/logoBig.webp';
const logoSmall = '/assets/images/logoSmall.webp';

export default function Logo() {
	const logoSrc =
		useBreakpointValue({
			base: logoSmall,
			sm: logoBig,
			md: logoSmall,
			lg: logoBig,
		}) || logoBig;

	const logoWidth =
		useBreakpointValue({
			base: 36,
			sm: 170,
			md: 36,
			lg: 170,
		}) || 170;

	const logoHeight = 36;

	return (
		<Link href='/'>
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
