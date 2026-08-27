'use client';

import { useSyncExternalStore } from 'react';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

type Selector<TState, TSlice> = (state: TState) => TSlice;

// Creates a zustand store whose server snapshot is cached for React 19 SSR.
export function createBoundedStore<TState>(initializer: StateCreator<TState>): BoundStore<TState> {
	const api = createStore<TState>(initializer);
	const serverSnapshot = api.getInitialState();

	const useBoundStore = (<TSlice>(selector: Selector<TState, TSlice>) =>
		useSyncExternalStore(api.subscribe, () => selector(api.getState()), () => selector(serverSnapshot))) as BoundStore<TState>;

	Object.assign(useBoundStore, api, {
		getServerState: () => serverSnapshot,
	});

	return useBoundStore;
}

type BoundStore<TState> = (<TSlice>(selector: Selector<TState, TSlice>) => TSlice) &
	StoreApi<TState> & { getServerState: () => TState };
