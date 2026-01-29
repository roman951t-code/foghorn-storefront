'use client';

import { ReactNode, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import system from '@/styles/chakraTheme';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';

export default function ChakraUIProvider({ children }: { children: ReactNode }) {
	const [{ cache, flush }] = useState(() => {
		const cache = createCache({ key: 'css', prepend: true });
		cache.compat = true;

		const prevInsert = cache.insert;
		let inserted: string[] = [];

		cache.insert = (...args) => {
			const serialized = args[1];
			if (cache.inserted[serialized.name] === undefined) {
				inserted.push(serialized.name);
			}
			return prevInsert(...args);
		};

		const flush = () => {
			const prev = inserted;
			inserted = [];
			return prev;
		};

		return { cache, flush };
	});

	useServerInsertedHTML(() => {
		const names = flush();
		if (!names.length) return null;

		let styles = '';
		for (const name of names) {
			const css = cache.inserted[name];
			if (typeof css === 'string') styles += css;
		}

		return (
			<style
				data-emotion={`${cache.key} ${names.join(' ')}`}
				dangerouslySetInnerHTML={{ __html: styles }}
			/>
		);
	});

	return (
		<CacheProvider value={cache}>
			<ChakraProvider value={system}>{children}</ChakraProvider>
		</CacheProvider>
	);
}
