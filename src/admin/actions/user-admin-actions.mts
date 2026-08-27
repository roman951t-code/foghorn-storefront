import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type UserAdminStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

const normalizeNotes = (value: unknown): string | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
};

const isValidStatus = (value: unknown): value is UserAdminStatus =>
	value === 'ACTIVE' || value === 'SUSPENDED' || value === 'BLOCKED';

const resolveAdminEmail = (currentAdmin: unknown): string | null => {
	if (!currentAdmin || typeof currentAdmin !== 'object') return null;
	const email = (currentAdmin as { email?: unknown }).email;
	return typeof email === 'string' && email.trim() ? email.trim() : null;
};

export const updateUserAdminMeta: ActionHandler<RecordActionResponse> = async (
	req,
	_res,
	context,
) => {
	const { record, resource, currentAdmin } = context;
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const method = String((req as { method?: unknown }).method ?? 'get').toLowerCase();

	if (!record || !resource) {
		throw new Error('Missing record context');
	}

	if (method === 'get') {
		return { record: record.toJSON(currentAdmin) };
	}

	const userId = record.param('id') as string;
	const previousStatus = record.param('adminStatus') as UserAdminStatus | undefined;
	const adminStatus = payload.adminStatus;
	const adminNotes = normalizeNotes(payload.adminNotes);

	if (!isValidStatus(adminStatus)) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'user-admin-update-invalid', type: 'error' },
		};
	}

	await prisma.$transaction(async (tx) => {
		await tx.user.update({
			where: { id: userId },
			data: {
				adminStatus,
				adminNotes,
			},
		});

		if (adminStatus !== 'ACTIVE') {
			const deleted = await tx.session.deleteMany({
				where: { userId },
			});

			if (deleted.count > 0) {
				await tx.userAuditEntry.create({
					data: {
						userId,
						type: 'SESSIONS_REVOKED',
						note: 'All user sessions revoked after admin status restriction',
						adminEmail: resolveAdminEmail(currentAdmin),
						metadata: {
							previousStatus: previousStatus ?? null,
							nextStatus: adminStatus,
							revokedCount: deleted.count,
						},
					},
				});
			}
		}
	});

	const updated = await resource.findOne(userId);
	return {
		record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
		notice: { message: 'user-admin-updated', type: 'success' },
	};
};
