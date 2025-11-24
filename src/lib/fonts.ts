// fonts.ts
import { Inter, Montserrat, Roboto } from 'next/font/google';

export const inter = Inter({
	subsets: ['latin', 'cyrillic'],
	display: 'swap',
	variable: '--font-inter',
});

export const montserrat = Montserrat({
	subsets: ['latin', 'cyrillic'],
	display: 'swap',
	variable: '--font-montserrat',
});

export const roboto = Roboto({
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '700'],
	display: 'swap',
	variable: '--font-roboto',
});
