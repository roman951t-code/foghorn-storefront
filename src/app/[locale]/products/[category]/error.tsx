'use client';

import { Box, Button, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function CategoryError({ error, reset }: ErrorProps) {
	const t = useTranslations('errors');

	return (
		<Box
			borderWidth='0.5px'
			borderColor='border'
			borderRadius='lg'
			bg='bg.tertiary'
			p='6'
			maxW='520px'
		>
			<VStack align='flex-start' gap='3'>
				<Heading as='h2' size='md' fontWeight='semibold'>
					{t('categoryUnavailableTitle')}
				</Heading>
				<Text color='main' fontSize='md'>
					{t('categoryUnavailableDesc')}
				</Text>
				{error?.digest ? (
					<Text color='muted' fontSize='sm'>
						{t('ref', { value: error.digest })}
					</Text>
				) : null}
				<HStack gap='3' pt='2'>
					<Button colorPalette='blue' rounded='md' onClick={reset}>
						{t('actions.tryAgain')}
					</Button>
					<Button asChild variant='outline' colorPalette='gray' rounded='md'>
						<LocaleNavLink href='/'>{t('actions.goHome')}</LocaleNavLink>
					</Button>
				</HStack>
			</VStack>
		</Box>
	);
}
