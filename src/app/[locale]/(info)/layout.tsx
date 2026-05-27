import { routing } from '@/i18n/routing';
import { ReactNode } from 'react';

// Route intent: public content pages use tagged cached CMS/static-page reads.
export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

interface Props {
	children: ReactNode;
}

export default function StaticLayout({ children }: Props) {
	return children;
}
