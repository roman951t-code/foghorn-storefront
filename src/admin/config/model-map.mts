import { prisma } from '../prisma.mts';

type PrismaRuntimeModel = { fields: unknown[]; [key: string]: unknown };
type PrismaRuntimeDataModel = { models: Record<string, PrismaRuntimeModel> };
const runtimeDataModel = (prisma as { _runtimeDataModel?: PrismaRuntimeDataModel })
	._runtimeDataModel;
if (!runtimeDataModel) {
	throw new Error('Prisma runtime data model is not available for AdminJS');
}

export const modelMap = Object.fromEntries(
	Object.entries(runtimeDataModel.models).map(([name, model]) => [name, { name, ...model }])
) as Record<string, PrismaRuntimeModel & { name: string }>;
