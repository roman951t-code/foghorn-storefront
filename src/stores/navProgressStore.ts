'use client';

import { createBoundedStore } from './createBoundedStore';

// Global counter of in-flight route transitions. Individual <Link> children
// bump it up when their `useLinkStatus().pending` flips true and back down
// when it settles. Buttons that call `router.push()` do the same via
// `useTrackedNavigation`. The top progress bar reads the counter and shows
// itself whenever it's > 0.
type NavProgressState = {
	pendingCount: number;
	start: () => void;
	finish: () => void;
	reset: () => void;
};

export const useNavProgressStore = createBoundedStore<NavProgressState>((set) => ({
	pendingCount: 0,
	start: () =>
		set((state) => ({
			pendingCount: state.pendingCount + 1,
		})),
	finish: () =>
		set((state) => ({
			pendingCount: Math.max(0, state.pendingCount - 1),
		})),
	reset: () => set({ pendingCount: 0 }),
}));

export const useIsNavPending = () =>
	useNavProgressStore((state) => state.pendingCount > 0);
