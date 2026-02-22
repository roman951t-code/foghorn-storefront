'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

type Session = Awaited<ReturnType<typeof authClient.getSession>>;

interface SessionContextValue {
	session: Session;
	refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);
const LOCALE_SEGMENT_PATTERN = /^[a-z]{2}$/i;

const getActiveSession = (value: Session): Session => {
	if (!value || typeof value !== 'object') return value;
	const nested = (value as { data?: Session }).data;
	return nested ?? value;
};

const hasActiveSession = (value: Session): boolean => {
	const active = getActiveSession(value);
	if (!active || typeof active !== 'object') return false;
	return !!(active as { session?: unknown }).session;
};

const getLocaleRootPath = (pathname: string | null): string => {
	if (!pathname) return '/';
	const [firstSegment] = pathname.split('/').filter(Boolean);
	if (!firstSegment || !LOCALE_SEGMENT_PATTERN.test(firstSegment)) return '/';
	return `/${firstSegment}`;
};

export function SessionProvider({
	children,
	initialSession,
}: {
	children: ReactNode;
	initialSession: Session;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const fallbackSession = (initialSession || { session: null }) as Session;
	const [session, setSession] = useState<Session>(fallbackSession);
	const wasAuthenticatedRef = useRef(hasActiveSession(fallbackSession));

	const refresh = useCallback(async () => {
		try {
			const res = await fetch('/api/session/extended', {
				cache: 'no-store',
			});
			if (!res.ok) return;

			const data = await res.json();
			if (data && typeof data === 'object' && 'error' in data) return;
			setSession(data as Session);
		} catch {
			// Keep the last known state when session refresh temporarily fails.
		}
	}, []);

	useEffect(() => {
		const channel = new BroadcastChannel('auth');
		const refreshSession = () => {
			void refresh();
		};

		const handleWindowFocus = () => {
			refreshSession();
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState !== 'visible') return;
			refreshSession();
		};

		channel.onmessage = (event) => {
			if (event.data === 'session-updated') {
				refreshSession();
			}
		};

		window.addEventListener('focus', handleWindowFocus);
		document.addEventListener('visibilitychange', handleVisibilityChange);

		const intervalId = window.setInterval(() => {
			refreshSession();
		}, 15_000);

		refreshSession();

		return () => {
			window.clearInterval(intervalId);
			window.removeEventListener('focus', handleWindowFocus);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			channel.close();
		};
	}, [refresh]);

	useEffect(() => {
		const isAuthenticated = hasActiveSession(session);
		const wasAuthenticated = wasAuthenticatedRef.current;
		wasAuthenticatedRef.current = isAuthenticated;

		if (!wasAuthenticated || isAuthenticated) return;

		void authClient.signOut().catch(() => {
			// Ignore sign-out cleanup errors; session is already considered invalid.
		});
		router.replace(getLocaleRootPath(pathname));
	}, [pathname, router, session]);

	const activeSession = getActiveSession(session);

	return (
		<SessionContext.Provider value={{ session: activeSession, refresh }}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const context = useContext(SessionContext);

	if (!context) throw new Error('useSession must be used within a SessionProvider');
	return context;
}

export function useOptionalSession() {
	return useContext(SessionContext);
}
