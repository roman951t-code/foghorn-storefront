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
		const res = await fetch('/api/session/extended', {
			cache: 'no-store',
		});
		const data = await res.json();
		setSession(data);
	};

	useEffect(() => {
		const channel = new BroadcastChannel('auth');
		channel.onmessage = (event) => {
			if (event.data === 'session-updated') {
				refresh();
			}
		};

		return () => channel.close();
	}, []);

	const activeSession = session?.data ? session?.data : session;

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
