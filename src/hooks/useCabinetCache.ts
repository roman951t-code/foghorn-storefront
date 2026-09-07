'use client';

import { useEffect, useRef, useState } from 'react';

type CacheEntry<T> = { data: T };

// Module-level (not component state), so it survives unmount/remount —
// switching cabinet tabs and back re-mounts the tab's page component, and
// without this the request would restart from scratch every time, which is
// exactly the "skeleton on every visit" this hook exists to avoid. Cleared
// on a full page reload, which is fine: it only needs to last the session.
const cache = new Map<string, CacheEntry<unknown>>();

export function invalidateCabinetCache(keyPrefix: string) {
	for (const key of cache.keys()) {
		if (key.startsWith(keyPrefix)) cache.delete(key);
	}
}

// Stale-while-revalidate: a cached entry renders immediately (no skeleton,
// no loading flash) while a fresh fetch runs silently underneath and
// updates the view if the result changed. A cache miss still shows the
// loading state for that one fetch, same as the old SSR-per-visit behavior.
export function useCabinetCache<T>(key: string, fetcher: () => Promise<T>) {
	const cached = cache.get(key) as CacheEntry<T> | undefined;
	const [data, setData] = useState<T | undefined>(cached?.data);
	const [loading, setLoading] = useState(!cached);
	const [error, setError] = useState(false);
	const fetcherRef = useRef(fetcher);
	fetcherRef.current = fetcher;

	useEffect(() => {
		let cancelled = false;
		const existing = cache.get(key) as CacheEntry<T> | undefined;
		if (existing) {
			setData(existing.data);
			setLoading(false);
		} else {
			setLoading(true);
		}
		setError(false);

		fetcherRef
			.current()
			.then((result) => {
				if (cancelled) return;
				cache.set(key, { data: result });
				setData(result);
				setLoading(false);
			})
			.catch(() => {
				if (cancelled) return;
				setLoading(false);
				if (!existing) setError(true);
			});

		return () => {
			cancelled = true;
		};
	}, [key]);

	return { data, loading, error };
}
