import { Montserrat, Noto_Sans, Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
	subsets: ['latin', 'cyrillic'],
	display: 'swap',
	variable: '--font-open-sans',
});

const montserrat = Montserrat({
	subsets: ['latin', 'cyrillic'],
	display: 'swap',
	variable: '--font-montserrat',
});

const notoSans = Noto_Sans({
	subsets: ['latin', 'cyrillic'],
	display: 'swap',
	variable: '--font-noto-sans',
});

export const fontVariableClassName = `${openSans.variable} ${montserrat.variable} ${notoSans.variable}`;
