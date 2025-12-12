import { Box, Card, Heading, HStack, Stack, Tag, Text, VStack, Wrap } from '@chakra-ui/react';
import { ReactNode } from 'react';

export type DetailOption = {
	key: string;
	label: string;
	icon: ReactNode;
};

type Props = {
	paymentTitle: string;
	shipmentTitle: string;
	guaranteeTitle: string;
	descriptionTitle: string;
	guaranteeText: string;
	descriptionText: string;
	paymentOptions: DetailOption[];
	shipmentOptions: DetailOption[];
};

export default function ProductDetails({
	paymentTitle,
	shipmentTitle,
	guaranteeTitle,
	descriptionTitle,
	guaranteeText,
	descriptionText,
	paymentOptions,
	shipmentOptions,
}: Props) {
	const renderOptions = (options: DetailOption[]) =>
		options.map((item) => (
			<Tag.Root
				key={item.key}
				variant='surface'
				borderWidth='0.5px'
				boxShadow='none'
				bg='bg.tertiary'
				borderColor='border.light'
				size='lg'
				color='main'
				py='1.5'
				mt={{ base: 4, sm: 0 }}
			>
				<Tag.Label fontSize='sm'>
					<HStack gapX='2.5' alignItems='center'>
						{item.icon ? (
							<Box fontSize='lg' color='fg.muted' display='inline-flex'>
								{item.icon}
							</Box>
						) : null}
						<Text as='span' fontWeight='semibold'>
							{item.label}
						</Text>
					</HStack>
				</Tag.Label>
			</Tag.Root>
		));

	return (
		<Stack w='100%' gap='4' mt='6'>
			<Wrap>
				<Card.Root flex='1' minW='280px' size='sm' bg='bg.tertiary' borderColor='border.light'>
					<Card.Header>
						<Heading size='md'>{paymentTitle}</Heading>
					</Card.Header>
					<Card.Body gap='4'>{renderOptions(paymentOptions)}</Card.Body>
				</Card.Root>

				<Card.Root minW='280px' flex='1' size='sm' bg='bg.tertiary' borderColor='border.light'>
					<Card.Header>
						<Heading size='md'>{shipmentTitle}</Heading>
					</Card.Header>
					<Card.Body gap='4'>{renderOptions(shipmentOptions)}</Card.Body>
				</Card.Root>
			</Wrap>

			<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
				<Card.Header>
					<Heading size='md'>{guaranteeTitle}</Heading>
				</Card.Header>
				<Card.Body>{guaranteeText}</Card.Body>
			</Card.Root>

			<Card.Root size='sm' bg='bg.tertiary' borderColor='border.light'>
				<Card.Header>
					<Heading size='md'>{descriptionTitle}</Heading>
				</Card.Header>
				<Card.Body>{descriptionText}</Card.Body>
			</Card.Root>
		</Stack>
	);
}
