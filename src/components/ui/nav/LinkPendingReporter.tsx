'use client';

import { useEffect } from 'react';
import { useLinkStatus } from 'next/link';
import { useNavProgressStore } from '@/stores/navProgressStore';

// Must be rendered as a descendant of a next/link <Link>. Reads that link's
// pending status via useLinkStatus() and mirrors it into the global
// navProgress store so the top progress bar can render.
//
// Emits no DOM output — it is purely a side-effect component.
export default function LinkPendingReporter() {
	const { pending } = useLinkStatus();
	const start = useNavProgressStore((state) => state.start);
	const finish = useNavProgressStore((state) => state.finish);

	useEffect(() => {
		if (!pending) return;
		start();
		return () => {
			finish();
		};
	}, [pending, start, finish]);

	return null;
}
