'use client';

import { Box, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import type { StorefrontFormPublic } from '@/actions/storefront/getEnabledStorefrontForms';

const COOKIE_NAME = 'store_cookie_consent';

function getCookie(name: string) {
	if (typeof document === 'undefined') return null;
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
	if (typeof document === 'undefined') return;
	const expires = new Date(Date.now() + days * 864e5).toUTCString();
	document.cookie = `${name}=${encodeURIComponent(
		value
	)}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function CookieConsentBanner({ form }: { form: StorefrontFormPublic | null }) {
	const [isOpen, setIsOpen] = useState(false);

	const content = useMemo(() => {
		if (!form) return null;
		const body = form.body?.trim() || form.description?.trim();
		return body ? body : null;
	}, [form]);

	useEffect(() => {
		if (!form) return;
		if (getCookie(COOKIE_NAME)) return;
		setIsOpen(true);
	}, [form]);

	if (!form || !isOpen) return null;

	const acceptLabel = form.acceptLabel?.trim() || 'Accept all';
	const declineLabel = form.declineLabel?.trim() || 'Essential only';

	return (
		<Box position='fixed' insetX={0} bottom={0} zIndex={1000} px={{ base: 3, md: 6 }} pb={4}>
			<Box
				maxW='1024px'
				mx='auto'
				bg='bg.tertiary'
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
				rounded='lg'
				boxShadow='lg'
				p={{ base: 4, md: 5 }}
			>
				<Flex
					gap={4}
					direction={{ base: 'column', md: 'row' }}
					align={{ base: 'stretch', md: 'center' }}
				>
					<Box flex='1'>
						<Heading as='h3' size='md' fontWeight='semibold'>
							{form.title}
						</Heading>
						{content ? (
							<Text mt={2} fontSize='md' color='gray.600' whiteSpace='pre-line' lineHeight='1.45'>
								{content}
							</Text>
						) : null}
						{form.linkHref ? (
							<HStack mt={2}>
								<LocaleNavLink
									href={form.linkHref}
									fontSize='md'
									color='link'
									textDecoration='underline'
									textUnderlineOffset='2px'
								>
									{form.linkLabel?.trim() || 'Cookie Policy'}
								</LocaleNavLink>
							</HStack>
						) : null}
					</Box>

					<HStack justifyContent={{ base: 'flex-end', md: 'flex-end' }} gap={3} flexWrap='wrap'>
						<SecondaryButton
							onClick={() => {
								setCookie(COOKIE_NAME, 'essential', 180);
								setIsOpen(false);
							}}
						>
							{declineLabel}
						</SecondaryButton>
						<PrimaryButton
							onClick={() => {
								setCookie(COOKIE_NAME, 'all', 180);
								setIsOpen(false);
							}}
						>
							{acceptLabel}
						</PrimaryButton>
					</HStack>
				</Flex>
			</Box>
		</Box>
	);
}
