import { prisma } from '../prisma.mts';
import { buildModelEnrichmentMap } from './prisma7-field-enricher.mts';

type PrismaRuntimeField = {
	name: string;
	kind: string;
	type: string;
	relationName?: string;
	[key: string]: unknown;
};
type PrismaRuntimeModel = { fields: PrismaRuntimeField[]; [key: string]: unknown };
type PrismaRuntimeDataModel = { models: Record<string, PrismaRuntimeModel> };

const runtimeDataModel = (prisma as { _runtimeDataModel?: PrismaRuntimeDataModel })
	._runtimeDataModel;
if (!runtimeDataModel) {
	throw new Error('Prisma runtime data model is not available for AdminJS');
}

// Prisma 7 stripped isId, isRequired, relationFromFields, relationToFields, etc. from
// both Prisma.dmmf and _runtimeDataModel. @adminjs/prisma needs these to identify the
// primary-key property and resolve FK columns for relations. We restore them by parsing
// the inlineSchema that Prisma embeds in the generated client config at build time.
const inlineSchema = (
	prisma as { _engineConfig?: { inlineSchema?: string } }
)._engineConfig?.inlineSchema;

const enrichmentMap = inlineSchema
	? buildModelEnrichmentMap(inlineSchema)
	: new Map<string, Map<string, Record<string, unknown>>>();

if (!inlineSchema) {
	console.warn(
		'[admin-model-map] _engineConfig.inlineSchema not available; ' +
			'AdminJS entity CRUD may fail. Ensure Prisma client is up to date.',
	);
}

const enrichFields = (modelName: string, fields: PrismaRuntimeField[]): unknown[] => {
	const modelMeta = enrichmentMap.get(modelName);
	return fields.map((field) => {
		const meta = modelMeta?.get(field.name);
		return {
			...field,
			isId: meta?.isId ?? false,
			isRequired: meta?.isRequired ?? true,
			isList: meta?.isList ?? false,
			hasDefaultValue: meta?.hasDefaultValue ?? false,
			isUpdatedAt: meta?.isUpdatedAt ?? false,
			isReadOnly: meta?.isReadOnly ?? false,
			isGenerated: meta?.isGenerated ?? false,
			isUnique: meta?.isUnique ?? false,
			relationFromFields: meta?.relationFromFields ?? [],
			relationToFields: meta?.relationToFields ?? [],
		};
	});
};

export const modelMap = Object.fromEntries(
	Object.entries(runtimeDataModel.models).map(([name, model]) => [
		name,
		{ name, ...model, fields: enrichFields(name, model.fields) },
	]),
) as Record<string, PrismaRuntimeModel & { name: string }>;
