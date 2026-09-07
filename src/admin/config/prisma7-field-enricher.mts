/**
 * Prisma 7 removed isId, isRequired, relationFromFields, relationToFields, etc.
 * from both Prisma.dmmf and _runtimeDataModel. @adminjs/prisma depends on these
 * to identify the primary-key property and resolve relation FK columns.
 *
 * This module parses the inlineSchema embedded in the generated Prisma client to
 * reconstruct the missing metadata so the adapter works correctly with Prisma 7+.
 */

export type EnrichedFieldMeta = {
	isId: boolean;
	isRequired: boolean;
	isList: boolean;
	hasDefaultValue: boolean;
	isUpdatedAt: boolean;
	isUnique: boolean;
	isReadOnly: boolean;
	isGenerated: boolean;
	relationFromFields?: string[];
	relationToFields?: string[];
};

export type ModelEnrichmentMap = Map<string, Map<string, EnrichedFieldMeta>>;

const PRISMA_SCALAR_TYPES = new Set([
	'String',
	'Boolean',
	'Int',
	'BigInt',
	'Float',
	'Decimal',
	'DateTime',
	'Json',
	'Bytes',
	'Unsupported',
]);

const parseListFromDecorator = (decoratorStr: string, key: 'fields' | 'references'): string[] => {
	const pattern = new RegExp(`\\b${key}\\s*:\\s*\\[([^\\]]*)\\]`);
	const match = decoratorStr.match(pattern);
	if (!match || !match[1].trim()) return [];
	return match[1]
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
};

type RawField = {
	fieldName: string;
	rawType: string;
	decorators: string;
};

const extractModelBlocks = (schema: string): Map<string, string> => {
	const result = new Map<string, string>();
	const lines = schema.split('\n');
	let currentModel: string | null = null;
	let depth = 0;
	const bodyLines: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();

		if (currentModel === null) {
			const modelMatch = trimmed.match(/^model\s+(\w+)\s*\{/);
			if (modelMatch) {
				currentModel = modelMatch[1];
				depth = 1;
				bodyLines.length = 0;
			}
			continue;
		}

		for (const ch of line) {
			if (ch === '{') depth++;
			else if (ch === '}') depth--;
		}

		if (depth <= 0) {
			result.set(currentModel, bodyLines.join('\n'));
			currentModel = null;
			depth = 0;
		} else {
			bodyLines.push(line);
		}
	}

	return result;
};

const parseFieldLine = (line: string): RawField | null => {
	const trimmed = line.trim();
	if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@') || trimmed.startsWith('@')) {
		return null;
	}
	const match = trimmed.match(/^([a-zA-Z_]\w*)\s+(\S+)(.*)/);
	if (!match) return null;
	return { fieldName: match[1], rawType: match[2], decorators: match[3] ?? '' };
};

export const buildModelEnrichmentMap = (schemaContent: string): ModelEnrichmentMap => {
	const result: ModelEnrichmentMap = new Map();
	const modelBlocks = extractModelBlocks(schemaContent);

	for (const [modelName, body] of modelBlocks) {
		const fields = new Map<string, EnrichedFieldMeta>();

		for (const line of body.split('\n')) {
			const parsed = parseFieldLine(line);
			if (!parsed) continue;

			const { fieldName, rawType, decorators } = parsed;

			const isList = rawType.endsWith('[]');
			const isNullable = !isList && rawType.endsWith('?');
			const baseType = rawType.replace(/[?[\]]/g, '');

			const isId = /@id\b/.test(decorators);
			const hasDefaultValue = /@default\s*\(/.test(decorators) || /@id\b/.test(decorators);
			const isUpdatedAt = /@updatedAt\b/.test(decorators);
			const isUnique = /@unique\b/.test(decorators);

			// Relation: find @relation(...) handling optional nested parens for onDelete/onUpdate actions
			let relationFromFields: string[] | undefined;
			let relationToFields: string[] | undefined;

			const relationMatch = decorators.match(/@relation\s*\([^)]*\)/);
			if (relationMatch) {
				const relStr = relationMatch[0];
				const fromFields = parseListFromDecorator(relStr, 'fields');
				const toFields = parseListFromDecorator(relStr, 'references');
				if (fromFields.length > 0) relationFromFields = fromFields;
				if (toFields.length > 0) relationToFields = toFields;
			}

			const isScalar = PRISMA_SCALAR_TYPES.has(baseType);

			fields.set(fieldName, {
				isId,
				isRequired: !isNullable,
				isList,
				hasDefaultValue: hasDefaultValue || isUpdatedAt,
				isUpdatedAt,
				isUnique,
				// In Prisma 5/6 DMMF, isReadOnly was false for all regular fields including updatedAt.
				// Keeping it false here ensures updatedAt/createdAt remain in the AdminJS property list
				// (they show in read-only views via resource-level property options, not adapter exclusion).
				isReadOnly: false,
				isGenerated: isId && isScalar && /@default\s*\(/.test(decorators),
				relationFromFields,
				relationToFields,
			});
		}

		result.set(modelName, fields);
	}

	return result;
};
