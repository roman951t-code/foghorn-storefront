import { useTranslation } from 'adminjs';
import {
	Box,
	Button,
	DropDown,
	DropDownItem,
	DropDownMenu,
	DropDownTrigger,
	Icon,
	Text,
} from '@adminjs/design-system';

type TopBarProps = {
	toggleSidebar: () => void;
};

type AdminState = {
	session?: { email?: string; title?: string; avatarUrl?: string };
	paths?: { rootPath?: string; logoutPath?: string };
	versions?: { admin?: string; app?: string };
};

type Versions = {
	admin?: string;
	app?: string;
};

type WindowWithAdminState = Window & {
	REDUX_STATE?: AdminState;
};

const Version = ({ versions }: { versions: Versions }) => {
	const { translateLabel } = useTranslation();
	const { admin, app } = versions;

	return (
		<Box flex flexGrow={1} py='default' px='xxl' data-css='version'>
			{admin ? (
				<Text display={['none', 'block']} color='grey100' style={{ padding: '12px 24px 12px 0' }}>
					{translateLabel('adminVersion', { version: admin })}
				</Text>
			) : null}
			{app ? (
				<Text display={['none', 'block']} color='grey100' style={{ padding: '12px 24px 12px 0' }}>
					{translateLabel('appVersion', { version: app })}
				</Text>
			) : null}
		</Box>
	);
};

const LanguageSelect = () => {
	const { i18n, translateComponent } = useTranslation();
	const supportedLngsRaw = i18n?.options?.supportedLngs;
	const supportedLngs = Array.isArray(supportedLngsRaw) ? supportedLngsRaw : [];
	const availableLanguages = supportedLngs.filter((lang: string) => lang !== 'cimode');

	if (availableLanguages.length <= 1) {
		return null;
	}

	return (
		<Box flex alignItems='center'>
			<DropDown>
				<DropDownTrigger>
					<Button color='text'>
						<Icon icon='Globe' />
						{translateComponent(`LanguageSelector.availableLanguages.${i18n.language}`, {
							defaultValue: i18n.language,
						})}
					</Button>
				</DropDownTrigger>
				<DropDownMenu>
					{availableLanguages.map((lang) => (
						<DropDownItem key={lang} onClick={() => i18n.changeLanguage(lang)}>
							{translateComponent(`LanguageSelector.availableLanguages.${lang}`, {
								defaultValue: lang,
							})}
						</DropDownItem>
					))}
				</DropDownMenu>
			</DropDown>
		</Box>
	);
};

export default function TopBar({ toggleSidebar }: TopBarProps) {
	const windowState = typeof window === 'undefined' ? null : (window as WindowWithAdminState);
	const reduxState = windowState?.REDUX_STATE ?? {};
	const session = reduxState.session;
	const paths = reduxState.paths;
	const versions = reduxState.versions;
	const { translateMessage, translateButton } = useTranslation();
	const rootPath = paths?.rootPath ?? '/admin';
	const logoutPath = paths?.logoutPath ?? `${rootPath}/logout`;
	const homeLabel = translateMessage('admin-home');

	return (
		<Box
			data-css='topbar'
			style={{
				height: '64px',
				borderBottom: '1px solid #E2E8F0',
				background: '#FFFFFF',
				display: 'flex',
				flexDirection: 'row',
				flexShrink: 0,
				alignItems: 'center',
			}}
		>
			<Box display='flex' alignItems='center' style={{ gap: 12 }}>
				<Button
					type='button'
					variant='text'
					py='lg'
					px={['default', 'lg']}
					onClick={toggleSidebar}
					aria-label='Toggle sidebar'
					display={['block', 'block', 'block', 'block', 'none']}
				>
					<Icon icon='Menu' size={24} />
				</Button>
				<a href={rootPath} className='admin-home-link'>
					<Icon icon='Home' />
					{homeLabel}
				</a>
			</Box>
			<Version versions={versions ?? {}} />
			<LanguageSelect />
			{session?.email ? (
				<a href={logoutPath} className='admin-home-link admin-logout-link'>
					<Icon icon='LogOut' />
					{translateButton('logout')}
				</a>
			) : null}
		</Box>
	);
}
