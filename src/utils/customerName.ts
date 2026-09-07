// If the first name already contains the last name (common for
// single-field "full name" signups), returns just the first name instead
// of duplicating it.
export const buildCustomerName = (
	first: string | null | undefined,
	last: string | null | undefined
): string | null => {
	const firstTrimmed = (first ?? '').trim();
	const lastTrimmed = (last ?? '').trim();
	if (!firstTrimmed && !lastTrimmed) return null;
	if (!lastTrimmed) return firstTrimmed || null;
	if (!firstTrimmed) return lastTrimmed || null;
	if (firstTrimmed.toLocaleLowerCase().includes(lastTrimmed.toLocaleLowerCase())) {
		return firstTrimmed;
	}
	return `${firstTrimmed} ${lastTrimmed}`;
};
