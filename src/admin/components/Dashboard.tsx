import { useTranslation } from 'adminjs';
import { Box, Button, H2, H4, H5, Illustration, Text } from '@adminjs/design-system';

type QuickAction = {
	key: string;
	path: string;
};

const quickActions: QuickAction[] = [
	{ key: 'orders', path: 'resources/Order' },
	{ key: 'products', path: 'resources/Product' },
	{ key: 'customers', path: 'resources/User' },
	{ key: 'reviews', path: 'resources/Review' },
];

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
};

const resolvePath = (path: string) => {
	if (typeof window === 'undefined') return path;
	const globalAny = window as typeof window & {
		REDUX_STATE?: { paths?: { rootPath?: string } };
	};
	const rootPath = globalAny.REDUX_STATE?.paths?.rootPath ?? '';
	const normalizedRoot = rootPath.replace(/\/$/, '');
	const normalizedPath = path.replace(/^\//, '');
	if (!normalizedRoot) return path;
	return `${normalizedRoot}/${normalizedPath}`;
};

const goTo = (path: string) => () => {
	if (typeof window !== 'undefined') {
		window.location.assign(resolvePath(path));
	}
};

export default function Dashboard() {
	const { translateMessage } = useTranslation();

	return (
		<Box variant='grey' p='xxl'>
			<Box
				variant='white'
				p='xxl'
				borderRadius='xl'
				boxShadow='sm'
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 32,
					flexWrap: 'wrap',
				}}
			>
				<Box style={{ maxWidth: 520 }}>
					<H2 mb='lg'>{translateMessage('dashboard.title')}</H2>
					<Text fontSize='lg' mb='xl'>
						{translateMessage('dashboard.subtitle')}
					</Text>
					<Box style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
						<Button
							variant='contained'
							color='primary'
							style={actionButtonStyle}
							onClick={goTo('resources/Order')}
						>
							{translateMessage('dashboard.primaryActions.orders')}
						</Button>
						<Button
							variant='contained'
							color='primary'
							style={actionButtonStyle}
							onClick={goTo('resources/Product/actions/new')}
						>
							{translateMessage('dashboard.primaryActions.products')}
						</Button>
						<Button
							variant='contained'
							color='primary'
							style={actionButtonStyle}
							onClick={goTo('resources/Review')}
						>
							{translateMessage('dashboard.primaryActions.reviews')}
						</Button>
					</Box>
				</Box>
				<Box style={{ minWidth: 240, display: 'flex', justifyContent: 'center' }}>
					<Illustration variant='Bag' width={200} height={180} />
				</Box>
			</Box>

			<Box mt='xxl'>
				<H4>{translateMessage('dashboard.dailyFocus.title')}</H4>
				<Text color='grey60'>{translateMessage('dashboard.dailyFocus.subtitle')}</Text>
			</Box>

			<Box
				mt='lg'
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
					gap: 16,
				}}
			>
				{quickActions.map((action) => (
					<Box
						key={action.key}
						variant='white'
						p='xl'
						borderRadius='xl'
						boxShadow='sm'
						style={{ border: '1px solid #E2E8F0' }}
					>
						<H5 mb='md'>{translateMessage(`dashboard.cards.${action.key}.title`)}</H5>
						<Text color='grey60' mb='xl'>
							{translateMessage(`dashboard.cards.${action.key}.description`)}
						</Text>
						<Button
							variant='contained'
							color='primary'
							style={actionButtonStyle}
							onClick={goTo(action.path)}
						>
							{translateMessage(`dashboard.cards.${action.key}.button`)}
						</Button>
					</Box>
				))}
			</Box>
		</Box>
	);
}
