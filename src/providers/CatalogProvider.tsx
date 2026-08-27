'use client';

import { useMemo } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';

export function useCatalog() {
	const categories = useCatalogStore((state) => state.categories);

	// Memoize to keep a stable reference for useSyncExternalStore (avoids dev warnings).
	return useMemo(() => ({ categories }), [categories]);
}
