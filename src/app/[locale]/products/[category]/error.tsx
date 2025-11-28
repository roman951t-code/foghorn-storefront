'use client';

import { Box, Button, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function CategoryError({ error, reset }: ErrorProps) {
	return (
		<Box
			borderWidth='1px'
			borderColor='border.light'
			borderRadius='lg'
			bg='bg.tertiary'
			p='6'
			maxW='520px'
			boxShadow='sm'
		>
			<VStack align='flex-start' gap='3'>
				<Heading as='h2' size='md' fontWeight='semibold'>
					Category is unavailable
				</Heading>
				<Text color='main' fontSize='md'>
					Something went wrong loading this category. Please retry or go back.
				</Text>
				{error?.digest ? (
					<Text color='muted' fontSize='sm'>
						Ref: {error.digest}
					</Text>
				) : null}
				<HStack gap='3' pt='2'>
					<Button colorPalette='blue' onClick={reset}>
						Try again
					</Button>
					<Button asChild variant='outline' colorPalette='gray'>
						<NextLink href='/'>Go home</NextLink>
					</Button>
				</HStack>
			</VStack>
		</Box>
	);
}
