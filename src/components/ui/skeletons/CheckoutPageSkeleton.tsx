'use client';

import { Box, Flex, Group, HStack, Skeleton, Stack } from '@chakra-ui/react';

// Shape mirrors [locale]/checkout/page.tsx:
// H1 → left checkout steps column + right sticky order-info aside.
export default function CheckoutPageSkeleton() {
	return (
		<Flex mx={{ base: '18px', '2xl': 0 }} gap={8} direction='column'>
			<Skeleton height='38px' width={{ base: '65%', md: '360px' }} rounded='md' />

			<Group justifyContent='space-between' align='flex-start' gapX='4'>
				<Box as='section' flex='1' minW={0}>
					<Stack gap={5}>
						{Array.from({ length: 3 }).map((_, index) => (
							<Box
								key={index}
								borderWidth='0.5px'
								borderStyle='solid'
								borderColor='border'
								rounded='lg'
								bg='bg.tertiary'
								p={{ base: 4, md: 5 }}
							>
								<HStack gap={3} align='center'>
									<Skeleton boxSize='28px' rounded='full' />
									<Skeleton height='22px' width='200px' rounded='md' />
								</HStack>
								<Stack mt={4} gap={3}>
									<Skeleton height='40px' width='100%' rounded='md' />
									<Skeleton height='40px' width='100%' rounded='md' />
									<Skeleton height='40px' width='60%' rounded='md' />
								</Stack>
							</Box>
						))}
					</Stack>
				</Box>

				<Box
					as='aside'
					w='360px'
					rounded='lg'
					bg='bg.tertiary'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					hideBelow='lg'
					position='sticky'
					top='76px'
					p={4}
				>
					<Skeleton height='24px' width='60%' rounded='md' />
					<Stack mt={4} gap={3}>
						{Array.from({ length: 3 }).map((_, index) => (
							<HStack key={index} gap={3}>
								<Skeleton boxSize='56px' rounded='md' />
								<Stack flex='1' gap={2}>
									<Skeleton height='14px' width='80%' rounded='md' />
									<Skeleton height='14px' width='40%' rounded='md' />
								</Stack>
							</HStack>
						))}
					</Stack>
					<Skeleton mt={5} height='1px' width='100%' />
					<Stack mt={4} gap={2}>
						<HStack justify='space-between'>
							<Skeleton height='14px' width='60px' rounded='md' />
							<Skeleton height='14px' width='80px' rounded='md' />
						</HStack>
						<HStack justify='space-between'>
							<Skeleton height='14px' width='60px' rounded='md' />
							<Skeleton height='14px' width='80px' rounded='md' />
						</HStack>
						<HStack justify='space-between'>
							<Skeleton height='20px' width='80px' rounded='md' />
							<Skeleton height='20px' width='100px' rounded='md' />
						</HStack>
					</Stack>
					<Skeleton mt={5} height='44px' width='100%' rounded='md' />
				</Box>
			</Group>
		</Flex>
	);
}
