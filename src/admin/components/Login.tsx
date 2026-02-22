import { useTranslation } from 'adminjs';
import { Box, Button, FormGroup, H2, H5, Illustration, Input, Label, MessageBox, Text } from '@adminjs/design-system';
import { useState, type ChangeEvent } from 'react';

type LoginState = {
	action?: string;
	errorMessage?: string | null;
};

type BrandingState = {
	logo?: string;
	companyName?: string;
	withMadeWithLove?: boolean;
};

type WindowWithAdminState = Window & {
	__APP_STATE__?: LoginState;
	REDUX_STATE?: {
		branding?: BrandingState;
	};
};

const actionButtonStyle = {
	borderColor: 'white',
	background: '#facc15',
	color: 'black',
};

const labelStyle = {
	fontSize: 15,
};

const getMessageText = (message: string, translateMessage: (key: string) => string) =>
	message.split(' ').length > 1 ? message : translateMessage(message);

export default function Login() {
	const windowState = window as WindowWithAdminState;
	const props = windowState.__APP_STATE__;
	const action = props?.action ?? '';
	const message = props?.errorMessage ?? undefined;
	const branding = windowState.REDUX_STATE?.branding ?? {};
	const { translateComponent, translateMessage } = useTranslation();
	const [email, setEmail] = useState('test@com');
	const [password, setPassword] = useState('test');

	const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
		setEmail(event.target.value);
	};

	const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};

	return (
		<Box
			variant='grey'
			flex
			className='admin-login-page'
			style={{
				minHeight: '100%',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '32px 16px',
			}}
		>
			<Box
				variant='white'
				p='xxl'
				borderRadius='xl'
				boxShadow='sm'
				style={{
					width: 'min(960px, 100%)',
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
					gap: 32,
				}}
			>
				<Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
					<H2>{translateComponent('Login.title')}</H2>
					<Text fontSize='lg'>{translateComponent('Login.subtitle')}</Text>
					<Box
						variant='grey'
						borderRadius='xl'
						p='xl'
						style={{ display: 'flex', alignItems: 'center', gap: 16 }}
					>
						<Illustration variant='Bag' width={120} height={110} />
						<Text color='grey60'>{translateComponent('Login.supportText')}</Text>
					</Box>
				</Box>
				<Box as='form' action={action} method='POST' style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
					<H5 marginBottom='lg'>
						{branding?.logo ? (
							<img
								src={branding.logo}
								alt={branding.companyName}
								style={{ maxWidth: 200 }}
							/>
						) : (
							branding?.companyName ?? 'Admin'
						)}
					</H5>
					{message ? (
						<MessageBox
							my='lg'
							message={getMessageText(message, translateMessage)}
							variant='danger'
						/>
					) : null}
					<FormGroup>
						<Label required style={labelStyle} htmlFor='admin-login-email'>
							{translateComponent('Login.properties.email')}
						</Label>
						<Input
							id='admin-login-email'
							name='email'
							type='email'
							autoComplete='email'
							placeholder={translateComponent('Login.properties.email')}
							value={email}
							onChange={handleEmailChange}
							required
						/>
					</FormGroup>
					<FormGroup>
						<Label required style={labelStyle} htmlFor='admin-login-password'>
							{translateComponent('Login.properties.password')}
						</Label>
						<Input
							id='admin-login-password'
							type='password'
							name='password'
							autoComplete='current-password'
							placeholder={translateComponent('Login.properties.password')}
							value={password}
							onChange={handlePasswordChange}
							required
						/>
					</FormGroup>
					<Box>
						<Button variant='contained' color='primary' style={actionButtonStyle}>
							{translateComponent('Login.loginButton')}
						</Button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
