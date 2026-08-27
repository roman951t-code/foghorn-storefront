import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
	subsets: ['latin', 'cyrillic'],
	display: 'swap',
	variable: '--font-open-sans',
});

export const fontVariableClassName = `${openSans.variable}`;
