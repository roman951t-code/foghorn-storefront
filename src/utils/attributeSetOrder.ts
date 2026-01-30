export type AttributeSetItem = {
	attributeId: string;
	sortOrder: number;
};

function buildOrderIndex(attributeSetItems: AttributeSetItem[]) {
	const sorted = [...attributeSetItems].sort(
		(a, b) => a.sortOrder - b.sortOrder || a.attributeId.localeCompare(b.attributeId)
	);
	const indexByAttributeId = new Map<string, number>();
	sorted.forEach((item, index) => {
		indexByAttributeId.set(item.attributeId, index);
	});
	return indexByAttributeId;
}

export function sortByAttributeSet<T extends { id: string; name: string }>(
	items: T[],
	attributeSetItems?: AttributeSetItem[] | null
) {
	if (!attributeSetItems || attributeSetItems.length === 0) {
		return [...items].sort((a, b) => a.name.localeCompare(b.name));
	}

	const orderIndex = buildOrderIndex(attributeSetItems);

	return [...items].sort((a, b) => {
		const aIndex = orderIndex.get(a.id);
		const bIndex = orderIndex.get(b.id);

		const aInSet = aIndex !== undefined;
		const bInSet = bIndex !== undefined;

		if (aInSet && bInSet) return aIndex - bIndex;
		if (aInSet) return -1;
		if (bInSet) return 1;

		return a.name.localeCompare(b.name);
	});
}

