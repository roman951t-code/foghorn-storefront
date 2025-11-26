// fonts.ts
import { Montserrat, Noto_Sans, Open_Sans } from 'next/font/google';

export const openSans = Open_Sans({
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '600', '700'],
	display: 'swap',
	variable: '--font-open-sans',
});

export const montserrat = Montserrat({
	subsets: ['latin', 'cyrillic'],
	weight: ['500', '600', '700'],
	display: 'swap',
	variable: '--font-montserrat',
});

export const notoSans = Noto_Sans({
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '600', '700'],
	display: 'swap',
	variable: '--font-noto-sans',
});
