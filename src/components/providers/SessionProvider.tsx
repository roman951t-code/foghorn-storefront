'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';

type Session = Awaited<ReturnType<typeof authClient.getSession>>;

interface SessionContextValue {
	session: Session;
	refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({
	children,
	initialSession,
}: {
	children: ReactNode;
	initialSession: Session;
}) {
	const [session, setSession] = useState<Session>(initialSession || { session: null });

	const refresh = async () => {
		const newSession = await authClient.getSession({
			query: {
				disableCookieCache: true,
			},
		});
		setSession(newSession);
	};

	// Optional: poll every 1 minute to check if session changed (e.g. expired or logged out in another tab)
	//   useEffect(() => {
	//     const interval = setInterval(refresh, 60_000);
	//     return () => clearInterval(interval);
	//   }, []);

	// Optional: cross-tab sync using BroadcastChannel
	useEffect(() => {
		const channel = new BroadcastChannel('auth');
		channel.onmessage = (event) => {
			if (event.data === 'session-updated') {
				refresh();
			}
		};
		return () => channel.close();
	}, []);

	return <SessionContext.Provider value={{ session, refresh }}>{children}</SessionContext.Provider>;
}

export function useSession() {
	const context = useContext(SessionContext);
	if (!context) throw new Error('useSession must be used within a SessionProvider');
	return context;
}
