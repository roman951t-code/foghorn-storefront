'use client';

import { createBoundedStore } from './createBoundedStore';
import type { CatalogCategory } from '@/types/product';

type CatalogState = {
	categories: CatalogCategory[];
	setCategories: (categories: CatalogCategory[]) => void;
};

export const useCatalogStore = createBoundedStore<CatalogState>((set) => ({
	categories: [],
	setCategories: (categories) => set({ categories }),
}));
