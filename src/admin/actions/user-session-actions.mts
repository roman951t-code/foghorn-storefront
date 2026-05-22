import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type SessionEntry = {
	id: string;
	createdAt: string;
	updatedAt: string;
	expiresAt: string;
	ipAddress: string | null;
	userAgent: string | null;
};

type UserSessionsPayload = {
	sessions: SessionEntry[];
};

const resolveAdminEmail = (currentAdmin: unknown): string | null => {
	if (!currentAdmin || typeof currentAdmin !== 'object') return null;
	const email = (currentAdmin as { email?: unknown }).email;
	return typeof email === 'string' && email.trim() ? email.trim() : null;
};

export const userSessions: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const userId = record.param('id') as string;

	const sessions = await prisma.session.findMany({
		where: { userId },
		orderBy: { updatedAt: 'desc' },
		select: {
			id: true,
			createdAt: true,
			updatedAt: true,
			expiresAt: true,
			ipAddress: true,
			userAgent: true,
		},
	});

	const payload: UserSessionsPayload = {
		sessions: sessions.map((session) => ({
			id: session.id,
			createdAt: session.createdAt.toISOString(),
			updatedAt: session.updatedAt.toISOString(),
			expiresAt: session.expiresAt.toISOString(),
			ipAddress: session.ipAddress ?? null,
			userAgent: session.userAgent ?? null,
		})),
	};

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};

export const revokeSession: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const method = ((req as { method?: string }).method ?? 'get').toLowerCase();
	if (method === 'get') {
		return {
			record: record.toJSON(currentAdmin),
		};
	}

	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.trim() : '';
	if (!sessionId) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'session-revoke-failed', type: 'error' },
		};
	}

	const userId = record.param('id') as string;
	const result = await prisma.$transaction(async (tx) => {
		const existingSession = await tx.session.findFirst({
			where: { id: sessionId, userId },
			select: { id: true, ipAddress: true, userAgent: true, createdAt: true, updatedAt: true },
		});

		if (!existingSession) return { count: 0 };

		const deleted = await tx.session.deleteMany({
			where: { id: sessionId, userId },
		});

		if (deleted.count > 0) {
			await tx.userAuditEntry.create({
				data: {
					userId,
					type: 'SESSION_REVOKED',
					note: 'User session revoked from admin panel',
					adminEmail: resolveAdminEmail(currentAdmin),
					metadata: {
						sessionId: existingSession.id,
						ipAddress: existingSession.ipAddress,
						userAgent: existingSession.userAgent,
						createdAt: existingSession.createdAt.toISOString(),
						updatedAt: existingSession.updatedAt.toISOString(),
					},
				},
			});
		}

		return deleted;
	});

	if (result.count === 0) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'session-not-found', type: 'error' },
		};
	}

	return {
		record: record.toJSON(currentAdmin),
		notice: { message: 'session-revoked', type: 'success' },
	};
};
