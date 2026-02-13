const DANGEROUS_FORMULA_PREFIX = /^[\u0000-\u001f\s]*[=+\-@]/;

export const neutralizeCsvFormula = (value: string) =>
	DANGEROUS_FORMULA_PREFIX.test(value) ? `'${value}` : value;

export const escapeCsvCell = (value: string) => {
	const normalized = neutralizeCsvFormula(value);
	const needsQuotes = /[",\n\r]/.test(normalized);
	const escaped = normalized.replace(/"/g, '""');
	return needsQuotes ? `"${escaped}"` : escaped;
};

export const buildCsvFromRows = (rows: string[][]) =>
	rows.map((row) => row.map((cell) => escapeCsvCell(cell ?? '')).join(',')).join('\n');
