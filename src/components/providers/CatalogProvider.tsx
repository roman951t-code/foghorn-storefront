// app/providers/CatalogProvider.tsx
'use client';

import { CatalogCategory } from '@/types/product';
import { createContext, useContext } from 'react';

type CatalogContextType = {
	categories: CatalogCategory[];
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({
	categories,
	children,
}: {
	categories: CatalogCategory[];
	children: React.ReactNode;
}) {
	return <CatalogContext.Provider value={{ categories }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
	const context = useContext(CatalogContext);
	if (!context) {
		throw new Error('useCatalog must be used within a CatalogProvider');
	}
	return context;
}
