'use client';

import { createContext, useContext, useTransition, type ReactNode, type TransitionStartFunction } from 'react';

type FilterTransitionContextValue = {
	isPending: boolean;
	startTransition: TransitionStartFunction;
};

const FilterTransitionContext = createContext<FilterTransitionContextValue>({
	isPending: false,
	startTransition: (callback) => callback(),
});

// Shared per-page transition so every filter control (sidebar checkboxes,
// quick filters, price slider, filter chips) marks the same `router.push` as
// low-priority: React then keeps the current ProductsGrid on screen instead
// of swapping in the route's loading.tsx skeleton, and exposes `isPending`
// here so ProductsGrid can render an overlay over the still-visible (stale)
// grid until the new RSC payload commits.
export function FilterTransitionProvider({ children }: { children: ReactNode }) {
	const [isPending, startTransition] = useTransition();

	return (
		<FilterTransitionContext.Provider value={{ isPending, startTransition }}>
			{children}
		</FilterTransitionContext.Provider>
	);
}

export function useFilterTransition() {
	return useContext(FilterTransitionContext);
}
