import type { ActionHandler, ActionRequest, ActionContext, RecordActionResponse } from 'adminjs';
import { randomUUID } from 'crypto';
import { prisma } from '../prisma.mts';
import { logInventoryAdjustment, resolveInventoryReason } from './inventory-adjustment-actions.mts';

type ProductAuditType = 'FIELD_CHANGE' | 'NOTE';

type ProductAuditEntryPayload = {
	id: string;
	type: ProductAuditType;
	field: string | null;
	fromValue: string | null;
	toValue: string | null;
	note: string | null;
	adminEmail: string | null;
	createdAt: string;
};

type ProductSnapshot = {
	basePrice: string;
	discountPrice: string | null;
	stock: number;
	slug: string;
	imageUrl: string | null;
};

const prismaAny = prisma as any;
let auditStorageReady: boolean | null = null;

const resolveAdminEmail = (currentAdmin: unknown): string | null => {
	if (!currentAdmin || typeof currentAdmin !== 'object') return null;
	const email = (currentAdmin as { email?: unknown }).email;
	if (typeof email !== 'string' || email.trim() === '') return null;
	return email;
};

const snapshotProduct = (product: any): ProductSnapshot => ({
	basePrice: String(product.basePrice ?? ''),
	discountPrice: product.discountPrice == null ? null : String(product.discountPrice),
	stock: Number(product.stock ?? 0),
	slug: String(product.slug ?? ''),
	imageUrl: product.imageUrl == null ? null : String(product.imageUrl),
});

const getTrackedDiffs = (before: ProductSnapshot, after: ProductSnapshot) => {
	const diffs: Array<{ field: keyof ProductSnapshot; fromValue: string | null; toValue: string | null }> = [];
	const push = (field: keyof ProductSnapshot, from: unknown, to: unknown) => {
		const fromValue = from == null ? null : String(from);
		const toValue = to == null ? null : String(to);
		if (fromValue === toValue) return;
		diffs.push({ field, fromValue, toValue });
	};
	push('basePrice', before.basePrice, after.basePrice);
	push('discountPrice', before.discountPrice, after.discountPrice);
	push('stock', before.stock, after.stock);
	push('slug', before.slug, after.slug);
	push('imageUrl', before.imageUrl, after.imageUrl);
	return diffs;
};

const ensureProductAuditStorage = async (): Promise<boolean> => {
	if (auditStorageReady === true) return true;
	try {
		await prisma.$executeRawUnsafe(`
			DO $$ BEGIN
				CREATE TYPE "public"."ProductAuditType" AS ENUM ('FIELD_CHANGE', 'NOTE');
			EXCEPTION WHEN duplicate_object THEN NULL;
			END $$;
		`);
		await prisma.$executeRawUnsafe(`
			CREATE TABLE IF NOT EXISTS "public"."ProductAuditEntry" (
				"id" TEXT NOT NULL,
				"productId" TEXT NOT NULL,
				"type" "public"."ProductAuditType" NOT NULL,
				"field" TEXT,
				"fromValue" TEXT,
				"toValue" TEXT,
				"note" TEXT,
				"adminEmail" TEXT,
				"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT "ProductAuditEntry_pkey" PRIMARY KEY ("id")
			);
		`);
		await prisma.$executeRawUnsafe(`
			CREATE INDEX IF NOT EXISTS "ProductAuditEntry_productId_createdAt_idx"
			ON "public"."ProductAuditEntry" ("productId", "createdAt");
		`);
		await prisma.$executeRawUnsafe(`
			DO $$ BEGIN
				ALTER TABLE "public"."ProductAuditEntry"
				ADD CONSTRAINT "ProductAuditEntry_productId_fkey"
				FOREIGN KEY ("productId") REFERENCES "public"."Product"("id")
				ON DELETE CASCADE ON UPDATE CASCADE;
			EXCEPTION WHEN duplicate_object THEN NULL;
			END $$;
		`);
		auditStorageReady = true;
		return true;
	} catch {
		auditStorageReady = false;
		return false;
	}
};

const toIsoString = (value: unknown): string => {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === 'string') return value;
	const parsed = new Date(String(value));
	return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
};

const buildActivityPayload = async (productId: string): Promise<ProductAuditEntryPayload[]> => {
	const available = await ensureProductAuditStorage();
	if (!available) return [];
	if (prismaAny.productAuditEntry) {
		const entries = await prismaAny.productAuditEntry.findMany({
			where: { productId },
			orderBy: { createdAt: 'desc' },
			take: 100,
		});
		return entries.map((entry: any) => ({
			id: entry.id,
			type: entry.type,
			field: entry.field ?? null,
			fromValue: entry.fromValue ?? null,
			toValue: entry.toValue ?? null,
			note: entry.note ?? null,
			adminEmail: entry.adminEmail ?? null,
			createdAt: entry.createdAt.toISOString(),
		}));
	}

	const rows = (await prisma.$queryRawUnsafe(
		`SELECT "id", "type", "field", "fromValue", "toValue", "note", "adminEmail", "createdAt"
		 FROM "public"."ProductAuditEntry"
		 WHERE "productId" = $1
		 ORDER BY "createdAt" DESC
		 LIMIT 100`,
		productId
	)) as Array<Record<string, unknown>>;
	return rows.map((entry) => ({
		id: String(entry.id),
		type: entry.type as ProductAuditType,
		field: entry.field ? String(entry.field) : null,
		fromValue: entry.fromValue ? String(entry.fromValue) : null,
		toValue: entry.toValue ? String(entry.toValue) : null,
		note: entry.note ? String(entry.note) : null,
		adminEmail: entry.adminEmail ? String(entry.adminEmail) : null,
		createdAt: toIsoString(entry.createdAt),
	}));
};

export const captureProductAuditBeforeHook = async (request: ActionRequest, context: ActionContext) => {
	const record = context.record as any;
	const method = String((request as { method?: unknown }).method ?? 'get').toLowerCase();
	if (method !== 'post' || !record) return request;

	const productId = record.param('id') as string;
	try {
		const product = await prisma.product.findUnique({
			where: { id: productId },
			select: { basePrice: true, discountPrice: true, stock: true, slug: true, imageUrl: true },
		});
		if (product) {
			(context as any).__productAuditBefore = snapshotProduct(product);
		}
	} catch {
		// ignore snapshot failures
	}

	return request;
};

const logProductFieldChanges = async (context: ActionContext) => {
	const available = await ensureProductAuditStorage();
	if (!available) return;
	const record = context.record as any;
	if (!record) return;

	const productId = record.param('id') as string;
	const before = (context as any).__productAuditBefore as ProductSnapshot | undefined;
	if (!before) return;

	const adminEmail = resolveAdminEmail(context.currentAdmin);

	const afterProduct = await prisma.product.findUnique({
		where: { id: productId },
		select: { basePrice: true, discountPrice: true, stock: true, slug: true, imageUrl: true },
	});
	if (!afterProduct) return;
	const after = snapshotProduct(afterProduct);
	const diffs = getTrackedDiffs(before, after);
	if (diffs.length === 0) return;

	if (prismaAny.productAuditEntry) {
		await prismaAny.$transaction(
			diffs.map((diff: any) =>
				prismaAny.productAuditEntry.create({
					data: {
						productId,
						type: 'FIELD_CHANGE',
						field: diff.field,
						fromValue: diff.fromValue,
						toValue: diff.toValue,
						adminEmail,
					},
				})
			)
		);
		return;
	}

	await Promise.all(
		diffs.map((diff) =>
			prisma.$executeRawUnsafe(
				`INSERT INTO "public"."ProductAuditEntry"
				("id", "productId", "type", "field", "fromValue", "toValue", "adminEmail")
				VALUES ($1, $2, $3, $4, $5, $6, $7)`,
				randomUUID(),
				productId,
				'FIELD_CHANGE',
				diff.field,
				diff.fromValue,
				diff.toValue,
				adminEmail
			)
		)
	);
};

export const productActivityTimeline: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) throw new Error('Missing record context');
	const productId = record.param('id') as string;
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const method = String((req as { method?: unknown }).method ?? 'get').toLowerCase();
	const adminEmail = resolveAdminEmail(currentAdmin);
	const available = await ensureProductAuditStorage();

	if (method === 'post') {
		if (!available) {
			return {
				record: record.toJSON(currentAdmin),
				payload: { entries: [], unavailable: true },
				notice: { message: 'product-activity-unavailable', type: 'error' },
			};
		}
		const note = typeof payload.note === 'string' ? payload.note.trim() : '';
		if (!note) {
			return {
				record: record.toJSON(currentAdmin),
				payload: { entries: await buildActivityPayload(productId), unavailable: false },
				notice: { message: 'product-activity-note-empty', type: 'error' },
			};
		}
		try {
			if (prismaAny.productAuditEntry) {
				await prismaAny.productAuditEntry.create({
					data: {
						productId,
						type: 'NOTE',
						note,
						adminEmail,
					},
				});
			} else {
				await prisma.$executeRawUnsafe(
					`INSERT INTO "public"."ProductAuditEntry"
					("id", "productId", "type", "note", "adminEmail")
					VALUES ($1, $2, $3, $4, $5)`,
					randomUUID(),
					productId,
					'NOTE',
					note,
					adminEmail
				);
			}
		} catch {
			return {
				record: record.toJSON(currentAdmin),
				payload: { entries: [], unavailable: true },
				notice: { message: 'product-activity-unavailable', type: 'error' },
			};
		}
		return {
			record: record.toJSON(currentAdmin),
			payload: { entries: await buildActivityPayload(productId), unavailable: false },
			notice: { message: 'product-activity-note-added', type: 'success' },
		};
	}

	try {
		const entries = await buildActivityPayload(productId);
		return {
			record: record.toJSON(currentAdmin),
			payload: { entries, unavailable: !available },
		};
	} catch {
		return {
			record: record.toJSON(currentAdmin),
			payload: { entries: [], unavailable: true },
		};
	}

	// unreachable
};

export const productAuditAfterHook = async (response: unknown, request: ActionRequest, context: ActionContext) => {
	const method = String((request as { method?: unknown }).method ?? 'get').toLowerCase();
	if (method !== 'post') return response;
	const noticeType = (response as { notice?: { type?: unknown } } | undefined)?.notice?.type;
	if (noticeType === 'error') return response;
	try {
		await logProductFieldChanges(context);
	} catch {
		// never block save on audit failures
	}
	try {
		const record = context.record as any;
		const productId = record?.param?.('id') as string | undefined;
		const before = (context as any).__productAuditBefore as ProductSnapshot | undefined;
		if (productId && before) {
			const afterProduct = await prisma.product.findUnique({
				where: { id: productId },
				select: { stock: true },
			});
			if (afterProduct) {
				const payload = (request as { payload?: Record<string, unknown> }).payload ?? {};
				const reason = resolveInventoryReason(payload.inventoryReason, 'Manual stock edit');
				const adminEmail = resolveAdminEmail(context.currentAdmin);
				await logInventoryAdjustment({
					productId,
					previousStock: before.stock,
					nextStock: Number(afterProduct.stock ?? 0),
					reason,
					source: 'EDIT',
					adminEmail,
				});
			}
		}
	} catch {
		// never block save on inventory history failures
	}
	return response;
};
