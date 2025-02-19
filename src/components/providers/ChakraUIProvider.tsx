'use client';

import { ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import system from '@/styles/chakraTheme';

export default function ChakraUIProvider({ children }: { children: ReactNode }) {
	return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
