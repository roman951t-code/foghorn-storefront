import { Link as LocaleLink } from '@/i18n/routing';

interface Props {
	href: string;
	text: string;
	children?: JSX.Element;
}

export default function LocaleNavLink({ href, text, children, ...props }: Props) {
	return (
		<LocaleLink href={href} className='localeLink' {...props}>
			{children}
			{text}
		</LocaleLink>
	);
}
