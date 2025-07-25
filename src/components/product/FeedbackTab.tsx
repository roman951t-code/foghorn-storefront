import { Card, Text, Flex, Stack, Heading, Separator } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Rating } from '../reusable/chakra/rating';

const FeedbackModal = dynamic(() => import('./FeedbackModal'));

export default function FeedbackTab() {
	const authT = useTranslations('Auth');
	const genT = useTranslations('General');
	const prodT = useTranslations('Products');

	const i18nData = {
		name: authT('name'),
		email: authT('email'),
		rate: prodT('rate'),
		leaveFeedback: prodT('leaveFeedback'),
		myRate: prodT('myRate'),
		send: genT('send'),
	};

	return (
		<Stack gap='4'>
			<Card.Root
				size='sm'
				minWidth='200px'
				w='100%'
				border='1px solid'
				borderColor='border.dark'
				bg='bg.tertiary'
			>
				<Card.Header p='4'>
					<Flex justifyContent='space-between' alignItems='center'>
						<Stack>
							<Heading size='md'> {prodT('feedbackTotal')}: 5</Heading>
							<Rating
								colorPalette={{ base: 'orange', _dark: 'yellow' }}
								readOnly
								size='xs'
								defaultValue={5}
							/>
						</Stack>
						<FeedbackModal i18nData={i18nData} />
					</Flex>
				</Card.Header>
			</Card.Root>

			<Card.Root
				size='sm'
				minWidth='200px'
				w='100%'
				border='1px solid'
				borderColor='border.dark'
				bg='bg.tertiary'
			>
				<Card.Header>
					<Flex justifyContent='space-between'>
						<Stack>
							<Heading size='md'> Богдан</Heading>
							<Rating
								colorPalette={{ base: 'orange', _dark: 'yellow' }}
								readOnly
								size='xs'
								defaultValue={5}
							/>
						</Stack>

						<Text color='main.disabled' textStyle='sm'>
							12.02.2024
						</Text>
					</Flex>
				</Card.Header>
				<Separator mt='4' color='border.dark' />
				<Card.Body color='main'>
					Купляв не сам збирав гроші певний час кинув на карту батькам. Вони купили гарантія є все
					як треба. Переживав на рахунок того може щось не так з ним бо багато міфів про те що
					яблука продають брак і тд. Але на зараз як вже другий тиждень користуюсь 16 максом
					задоволений ніяких непорозумінь немає все чудово працює. Загалом рекомендую
				</Card.Body>
			</Card.Root>
			<Card.Root
				size='sm'
				minWidth='200px'
				w='100%'
				border='1px solid'
				borderColor='border.dark'
				bg='bg.tertiary'
			>
				<Card.Header>
					<Flex justifyContent='space-between'>
						<Stack>
							<Heading size='md'> Микола</Heading>
							<Rating
								colorPalette={{ base: 'orange', _dark: 'yellow' }}
								readOnly
								size='xs'
								defaultValue={4}
							/>
						</Stack>

						<Text color='main.disabled' textStyle='sm'>
							15.02.2025
						</Text>
					</Flex>
				</Card.Header>
				<Separator mt='4' color='border.dark' />
				<Card.Body color='main'>
					Купляв не сам збирав гроші певний час кинув на карту батькам. Вони купили гарантія є все
					як треба. Переживав на рахунок того може щось не так з ним бо багато міфів про те що
					яблука продають брак і тд. Але на зараз як вже другий тиждень користуюсь 16 максом
					задоволений ніяких непорозумінь немає все чудово працює. Загалом рекомендую
				</Card.Body>
			</Card.Root>
		</Stack>
	);
}
