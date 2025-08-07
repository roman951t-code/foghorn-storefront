import { Link as ChakraLink } from '@chakra-ui/react';
import { Link } from '@/i18n/routing';
import type { ReactNode } from 'react';
import { PrimaryButton, SecondaryButton } from '../buttons/ActionButton';

interface Props {
	href: string;
	children?: ReactNode;
	[key: string]: any;
}

export function LocaleSearchLink({ href, children, ...props }: Props) {
	return (
		<Link href={href}>
			<ChakraLink
				as='span'
				transition='all .15s ease-in-out'
				textDecorationColor='main'
				_hover={{ color: 'link' }}
				_focus={{ outline: 'none' }}
				{...props}
			>
				{children}
			</ChakraLink>
		</Link>
	);
}

export function LocaleNavLink({ href, children, ...props }: Props) {
	return (
		<Link href={href}>
			<ChakraLink
				as='span'
				transition='all .15s ease-in-out'
				textDecorationColor='main'
				_hover={{ color: 'link' }}
				_focus={{ outline: 'none' }}
				{...props}
			>
				{children}
			</ChakraLink>
		</Link>
	);
}

export function LocaleNavButton({ href, children, ...props }: Props) {
	return (
		<Link href={href}>
			<PrimaryButton {...props}>{children}</PrimaryButton>
		</Link>
	);
}

export function LocaleNavSecButton({ href, children, ...props }: Props) {
	return (
		<Link href={href}>
			<SecondaryButton {...props}>{children}</SecondaryButton>
		</Link>
	);
}
