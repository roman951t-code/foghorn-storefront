'use client';

import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { Checkbox } from '@/components/ui/chakra/checkbox';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { useCheckoutStore } from '@/stores/checkoutStore';
import type { StorefrontFormPublic } from '@/actions/storefront/getEnabledStorefrontForms';
import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { isBlockingCheckoutConsent } from './checkoutConsentUtils';

export default function CheckoutConsents({ forms }: { forms: StorefrontFormPublic[] }) {
	const checkoutT = useTranslations('checkout');

	const enabledForms = useMemo(
		() =>
			(forms ?? [])
				.filter((f) => f.enabled)
				.slice()
				.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
		[forms]
	);

	const consents = useCheckoutStore((s) => s.consents);
	const setConsent = useCheckoutStore((s) => s.setConsent);

	useEffect(() => {
		if (!enabledForms.length) return;
		useCheckoutStore.setState((state) => {
			const next = { ...state.consents };
			let changed = false;
			for (const form of enabledForms) {
				if (next[form.key] === undefined) {
					next[form.key] = false;
					changed = true;
				}
			}
			return changed ? { consents: next } : state;
		});
	}, [enabledForms]);

	if (!enabledForms.length) return null;

	return (
		<Box
			w='full'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			rounded='lg'
			bg='bg.tertiary'
			p={4}
		>
			<Heading as='h4' size='md' fontWeight='semibold'>
				{checkoutT('agreementsTitle')}
			</Heading>

			<VStack mt={3} alignItems='stretch' gap={3}>
				{enabledForms.map((form) => {
					const checked = !!consents[form.key];
					const label = (form.checkboxLabel?.trim() || form.title).trim();
					const isRequired = isBlockingCheckoutConsent(form);
					return (
						<Checkbox
							key={form.key}
							checked={checked}
							onCheckedChange={(details) => setConsent(form.key, !!details.checked)}
							alignItems='flex-start'
							gap={3}
							py={1}
							inputProps={{ required: isRequired }}
						>
							<VStack alignItems='flex-start' gap={1}>
								<Text fontSize={{ base: 'md', md: 'sm' }} lineHeight='1.35'>
									{label}
									{isRequired ? (
										<Text as='span' color='main.tertiary'>
											{' '}
											*
										</Text>
									) : null}
								</Text>

								{form.description ? (
									<Text fontSize={{ base: 'md', md: 'sm' }} color='main.disabled'>
										{form.description}
									</Text>
								) : null}

								{form.linkHref ? (
									<HStack gap={2}>
										<LocaleNavLink
											href={form.linkHref}
											fontSize={{ base: 'md', md: 'sm' }}
											color='link'
											textDecoration='underline'
											textUnderlineOffset='2px'
										>
											{form.linkLabel?.trim() || checkoutT('learnMore')}
										</LocaleNavLink>
									</HStack>
								) : null}
							</VStack>
						</Checkbox>
					);
				})}
			</VStack>
		</Box>
	);
}
