type AdminApiContext = {
	resourceId?: string;
	recordId?: string;
};

const NOTICE_RECORD_NOT_FOUND_IN_RESOURCE =
	/^Record with given id: "([^"]+)" cannot be found in resource "([^"]+)"$/;
const NOTICE_BULK_RECORD_NOT_FOUND_IN_RESOURCE =
	/^record with given id: "([^"]+)" cannot be found in resource "([^"]+)"$/;
const NOTICE_RESOURCE_NOT_FOUND = /^Resource of given id: "([^"]+)" cannot be found$/;
const NOTICE_RESOURCE_ACTION_NOT_FOUND =
	/^Resource of given id: "([^"]+)" does not have an action with name: "([^"]+)" or you are not authorized to use it!?$/;
const NOTICE_RESOURCE_RECORD_NOT_FOUND =
	/^Resource of given id: "([^"]+)" does not have a record with id: "([^"]+)" or you are not authorized to use it!?$/;
const NOTICE_RECORD_NOT_FOUND_BY_ID_ONLY = /^Record of given id \("([^"]+)"\) could not be found$/;

const safeDecodeURIComponent = (value: string) => {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
};

export const getAdminApiContextFromPath = (path: string): AdminApiContext => {
	const recordActionMatch = path.match(/^\/api\/resources\/([^/]+)\/records\/([^/]+)\/[^/]+$/);
	if (recordActionMatch) {
		return {
			resourceId: safeDecodeURIComponent(recordActionMatch[1]),
			recordId: safeDecodeURIComponent(recordActionMatch[2]),
		};
	}
	const bulkActionMatch = path.match(/^\/api\/resources\/([^/]+)\/bulk\/[^/]+$/);
	if (bulkActionMatch) {
		return {
			resourceId: safeDecodeURIComponent(bulkActionMatch[1]),
		};
	}
	const resourceActionMatch = path.match(/^\/api\/resources\/([^/]+)\/actions\/[^/]+$/);
	if (resourceActionMatch) {
		return {
			resourceId: safeDecodeURIComponent(resourceActionMatch[1]),
		};
	}
	return {};
};

export const getAdminApiActionNameFromPath = (path: string) => {
	const matchResourceAction = path.match(/^\/api\/resources\/[^/]+\/actions\/([^/]+)$/);
	const matchRecordAction = path.match(/^\/api\/resources\/[^/]+\/records\/[^/]+\/([^/]+)$/);
	const matchBulkAction = path.match(/^\/api\/resources\/[^/]+\/bulk\/([^/]+)$/);
	const actionName = matchResourceAction?.[1] ?? matchRecordAction?.[1] ?? matchBulkAction?.[1];
	return actionName ? safeDecodeURIComponent(actionName) : null;
};

const replaceNoticeMessage = (
	notice: Record<string, unknown>,
	message: string,
	options: Record<string, unknown> = {},
): Record<string, unknown> => {
	const existingOptions =
		typeof notice.options === 'object' && notice.options !== null
			? (notice.options as Record<string, unknown>)
			: {};
	const mergedOptions = { ...existingOptions, ...options };
	return {
		...notice,
		message,
		...(Object.keys(mergedOptions).length > 0 ? { options: mergedOptions } : {}),
	};
};

const normalizeAdminNotice = (noticeValue: unknown, context: AdminApiContext): unknown => {
	if (!noticeValue || typeof noticeValue !== 'object') return noticeValue;
	const notice = noticeValue as Record<string, unknown>;
	const message = typeof notice.message === 'string' ? notice.message.trim() : '';
	if (!message) return noticeValue;

	if (
		message === 'You have to pass recordId to the recordAction' ||
		message === 'You have to pass "recordId" to Delete Action'
	) {
		return replaceNoticeMessage(notice, 'admin-record-id-required');
	}

	if (message === 'You have to pass a valid recordId to the recordAction') {
		return replaceNoticeMessage(notice, 'admin-record-id-invalid');
	}

	if (
		message === 'You have to pass "recordIds" to the bulkAction via search params: ?recordIds=...'
	) {
		return replaceNoticeMessage(notice, 'admin-record-ids-required');
	}

	if (message === 'no records were selected.') {
		return replaceNoticeMessage(notice, 'noRecordsSelected');
	}

	let match = message.match(NOTICE_RECORD_NOT_FOUND_IN_RESOURCE);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Record', {
			recordId: match[1],
			resourceId: match[2],
		});
	}

	match = message.match(NOTICE_BULK_RECORD_NOT_FOUND_IN_RESOURCE);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Record', {
			recordId: match[1],
			resourceId: match[2],
		});
	}

	match = message.match(NOTICE_RESOURCE_NOT_FOUND);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Resource', { resourceId: match[1] });
	}

	match = message.match(NOTICE_RESOURCE_ACTION_NOT_FOUND);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Action', {
			resourceId: match[1],
			actionName: match[2],
		});
	}

	match = message.match(NOTICE_RESOURCE_RECORD_NOT_FOUND);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Record', {
			resourceId: match[1],
			recordId: match[2],
		});
	}

	match = message.match(NOTICE_RECORD_NOT_FOUND_BY_ID_ONLY);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Record', {
			resourceId: context.resourceId ?? '',
			recordId: match[1],
		});
	}

	return noticeValue;
};

export const normalizeAdminApiNoticeResponse = (
	payload: unknown,
	context: AdminApiContext,
): unknown => {
	if (!payload || typeof payload !== 'object') return payload;
	const responseBody = payload as Record<string, unknown>;
	const normalizedNotice = normalizeAdminNotice(responseBody.notice, context);
	if (normalizedNotice === responseBody.notice) return payload;
	return {
		...responseBody,
		notice: normalizedNotice,
	};
};
