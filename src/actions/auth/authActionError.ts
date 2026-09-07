type ErrorMessageContainer = {
	message?: unknown;
	body?: unknown;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

export const getActionErrorMessageKey = (error: unknown): string => {
	if (!isObjectRecord(error)) return '';

	const typedError = error as ErrorMessageContainer;
	if (typeof typedError.message === 'string' && typedError.message.length > 0) {
		return typedError.message;
	}

	if (isObjectRecord(typedError.body) && typeof typedError.body.message === 'string') {
		return typedError.body.message;
	}

	return '';
};
