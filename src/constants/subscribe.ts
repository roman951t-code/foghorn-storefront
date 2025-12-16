export const SUBSCRIBE_COMMON_KEYS = [
	'subscribeInfo',
	'subscribeProcedure',
	'subscribe',
	'subscribed',
	'unsubscribe',
	'subscribedSuccessfully',
	'unsubscribedSuccessfully',
] as const;

export const SUBSCRIBE_AUTH_KEYS = [
	'email',
	'verifyEmail',
	'emailConfirmation',
	'toPost',
	'signUpCodeSent',
	'confirmEmail',
	'resendAfter',
	'resendCode',
	'emailUpdated',
] as const;

export const SUBSCRIBE_VALIDATION_KEYS = [
	'emailNotVerifiedError',
	'subscribeFail',
	'editEmailFail',
	'invalidFormData',
	'unsubscribeFail',
	'emailRequired',
	'inputMaxLength',
	'wrongEmail',
] as const;
