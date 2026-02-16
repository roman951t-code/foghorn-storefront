import { BaseRecord, type Filter } from 'adminjs';
import { Resource as PrismaResource } from '@adminjs/prisma';
import type { DMMF } from '@prisma/client/runtime/library.js';

type FindParams = {
	limit?: number;
	offset?: number;
	sort?: {
		sortBy?: string;
		direction?: 'asc' | 'desc';
	};
};

const getProductNameFilterValue = (filter: Filter | undefined) => {
	const rawName = (filter as { filters?: Record<string, { value?: unknown }> } | undefined)?.filters
		?.name?.value;
	if (typeof rawName !== 'string') return null;
	const trimmed = rawName.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const isNumeric = (value: unknown) => {
	const stringValue = String(value).replace(/,/g, '.');
	if (Number.isNaN(Number.parseFloat(stringValue))) return false;
	return Number.isFinite(Number(stringValue));
};

const safeParseNumber = (value: unknown) => {
	if (isNumeric(value)) return Number(value);
	return value;
};

const safeParseJSON = (json: unknown) => {
	if (typeof json !== 'string') return null;
	try {
		return JSON.parse(json);
	} catch {
		return null;
	}
};

const convertParam = (
	property: {
		type: () => string;
		foreignColumnName: () => string | null;
	},
	fields: DMMF.Model['fields'],
	value: unknown
) => {
	const type = property.type();
	if (type === 'mixed') return value;
	if (type === 'number') return safeParseNumber(value);
	if (type === 'reference') {
		const foreignColumnName = property.foreignColumnName();
		if (!foreignColumnName) return value;
		const foreignColumn = fields.find((field) => field.name === foreignColumnName);
		if (!foreignColumn || value === undefined || value === null) return value;
		if (foreignColumn.type === 'String') return String(value);
		return safeParseNumber(value);
	}
	return value;
};

const convertFilterLocal = (modelFields: DMMF.Model['fields'], filterObject?: Filter) => {
	if (!filterObject) return {} as Record<string, unknown>;
	const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[5|4|3|2|1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
	const filters = (filterObject as { filters?: Record<string, any> }).filters ?? {};
	return Object.entries(filters).reduce<Record<string, unknown>>((where, [name, filter]) => {
		const propertyType = filter?.property?.type?.();
		if (['boolean', 'number', 'float', 'object', 'array'].includes(propertyType)) {
			where[name] = safeParseJSON(filter?.value);
			return where;
		}
		if (['date', 'datetime'].includes(propertyType)) {
			const value = filter?.value;
			if (typeof value !== 'string' && value?.from && value?.to) {
				where[name] = { gte: new Date(value.from), lte: new Date(value.to) };
				return where;
			}
			if (typeof value !== 'string' && value?.from) {
				where[name] = { gte: new Date(value.from) };
				return where;
			}
			if (typeof value !== 'string' && value?.to) {
				where[name] = { lte: new Date(value.to) };
				return where;
			}
			return where;
		}
		if (filter?.property?.isEnum?.()) {
			where[name] = { equals: filter?.value };
			return where;
		}
		if (propertyType === 'string' && uuidRegex.test(String(filter?.value ?? ''))) {
			where[name] = { equals: filter?.value };
			return where;
		}
		if (propertyType === 'reference' && filter?.property?.foreignColumnName?.()) {
			const foreignColumnName = filter.property.foreignColumnName();
			if (foreignColumnName) {
				where[foreignColumnName] = convertParam(filter.property, modelFields, filter?.value);
			}
			return where;
		}
		where[name] = { contains: String(filter?.value ?? '') };
		return where;
	}, {});
};

export class CaseInsensitiveProductPrismaResource extends PrismaResource {
	private buildWhere(filter: Filter | undefined) {
		const where = convertFilterLocal(this.model.fields, filter);
		if (this.id() !== 'Product') return where;
		const nameFilter = getProductNameFilterValue(filter);
		if (!nameFilter) return where;
		where.name = { contains: nameFilter, mode: 'insensitive' };
		return where;
	}

	override async count(filter: Filter) {
		return this.manager.count({
			where: this.buildWhere(filter),
		});
	}

	override async find(filter: Filter, params: FindParams = {}) {
		const { limit = 10, offset = 0, sort = {} } = params;
		const orderBy = this.buildSortBy(sort);
		const results = await this.manager.findMany({
			where: this.buildWhere(filter),
			skip: offset,
			take: limit,
			orderBy,
		});
		return results.map((result: Record<string, unknown>) =>
			new BaseRecord(this.prepareReturnValues(result), this)
		);
	}
}
