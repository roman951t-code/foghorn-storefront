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
	const result = await prisma.session.deleteMany({
		where: { id: sessionId, userId },
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
