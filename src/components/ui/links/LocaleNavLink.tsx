import {
	Link as ChakraLink,
	type LinkProps as ChakraLinkProps,
	type ButtonProps,
} from '@chakra-ui/react';
import { Link } from '@/i18n/routing';
import type { ReactNode } from 'react';
import { PrimaryButton, SecondaryButton } from '../buttons/ActionButton';
import LinkPendingReporter from '../nav/LinkPendingReporter';

type LocaleLinkProps = Omit<ChakraLinkProps, 'href'> & {
	href: string;
	children?: ReactNode;
};

type LocaleButtonLinkProps = ButtonProps & {
	href: string;
	children?: ReactNode;
};

export function LocaleSearchLink({ href, children, ...props }: LocaleLinkProps) {
	return (
		<Link href={href}>
			<LinkPendingReporter />
			<ChakraLink
				as='span'
				transition='all .15s ease-in-out'
				textDecorationColor='main'
				_hover={{ color: 'link' }}
				_focusVisible={{
					outline: '2px solid',
					outlineColor: 'main.secondary',
					outlineOffset: '2px',
				}}
				{...props}
			>
				{children}
			</ChakraLink>
		</Link>
	);
}

export function LocaleNavLink({ href, children, ...props }: LocaleLinkProps) {
	return (
		<Link href={href}>
			<LinkPendingReporter />
			<ChakraLink
				as='span'
				fontSize={{ base: 'md', md: '14px' }}
				transition='all .15s ease-in-out'
				textDecorationColor='main'
				_hover={{ color: 'link' }}
				_focusVisible={{
					outline: '2px solid',
					outlineColor: 'main.secondary',
					outlineOffset: '2px',
				}}
				{...props}
			>
				{children}
			</ChakraLink>
		</Link>
	);
}

export function LocaleNavButton({ href, children, ...props }: LocaleButtonLinkProps) {
	return (
		<Link href={href}>
			<LinkPendingReporter />
			<PrimaryButton {...props}>{children}</PrimaryButton>
		</Link>
	);
}

export function LocaleNavSecButton({ href, children, ...props }: LocaleButtonLinkProps) {
	return (
		<Link href={href}>
			<LinkPendingReporter />
			<SecondaryButton {...props}>{children}</SecondaryButton>
		</Link>
	);
}
