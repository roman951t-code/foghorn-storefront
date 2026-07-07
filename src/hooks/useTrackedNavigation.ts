'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useNavProgressStore } from '@/stores/navProgressStore';

type TransitionOptions = { scroll?: boolean };

// Drop-in wrapper for `router.push` that mirrors the pending state into the
// global nav-progress store and exposes an `isPending` flag callers can wire
// into individual buttons (loading spinner / disabled state).
//
// Use this instead of `useRouter().push(...)` at any button that triggers a
// navigation but doesn't render an <a> — pagination arrows, sort dropdowns,
// filter chips, etc. Existing `<Link>` callsites don't need this; they get
// pending state via <LinkPendingReporter />.
export function useTrackedNavigation() {
	const router = useRouter();
	const pathname = usePathname();
	const start = useNavProgressStore((state) => state.start);
	const finish = useNavProgressStore((state) => state.finish);
	const [isPending, setIsPending] = useState(false);
	const [pendingTargetKey, setPendingTargetKey] = useState<string | null>(null);

	// Router.push resolves before the destination has finished rendering, so we
	// can't just await it. Instead, we start progress on push and stop it once
	// the pathname (or a same-path search-param change we passed as target)
	// matches what we asked for.
	useEffect(() => {
		if (!isPending || !pendingTargetKey) return;
		if (typeof window === 'undefined') return;

		const currentKey = `${pathname}?${window.location.search.replace(/^\?/, '')}`;
		if (currentKey === pendingTargetKey) {
			setIsPending(false);
			setPendingTargetKey(null);
			finish();
		}
	}, [pathname, isPending, pendingTargetKey, finish]);

	// Safety net: never leave the counter incremented if the navigation gets
	// aborted (e.g. because the user clicks another link before the first
	// resolves). Timeouts here are a lot cheaper than a stuck progress bar.
	useEffect(() => {
		if (!isPending) return;
		const timeoutId = window.setTimeout(() => {
			setIsPending(false);
			setPendingTargetKey(null);
			finish();
		}, 8000);
		return () => window.clearTimeout(timeoutId);
	}, [isPending, finish]);

	const push = useCallback(
		(href: string, options?: TransitionOptions) => {
			start();
			setIsPending(true);
			setPendingTargetKey(normalizeTargetKey(href));
			router.push(href, options);
		},
		[router, start],
	);

	const replace = useCallback(
		(href: string, options?: TransitionOptions) => {
			start();
			setIsPending(true);
			setPendingTargetKey(normalizeTargetKey(href));
			router.replace(href, options);
		},
		[router, start],
	);

	return { push, replace, isPending };
}

const normalizeTargetKey = (href: string) => {
	try {
		const url = new URL(href, 'https://example.com');
		return `${url.pathname}?${url.search.replace(/^\?/, '')}`;
	} catch {
		return href;
	}
};
