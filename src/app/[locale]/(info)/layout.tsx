import { routing } from '@/i18n/routing';
import { ReactNode } from 'react';

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

interface Props {
	children: ReactNode;
}

export default function StaticLayout({ children }: Props) {
	return children;
}
