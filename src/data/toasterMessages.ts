import type { I18nData } from '@/types/i18n';

type Translate = (key: string) => string;

const resolveMessage = (source: string | Translate | null | undefined, key?: string): string => {
	if (typeof source === 'function') {
		return key ? source(key) : '';
	}
	return source ?? '';
};

export const toasterMessages = {
	newsletterSubscribeSuccess: (i18nData: I18nData) => i18nData.subscribedSuccessfully,
	newsletterSubscribeFail: (i18nData: I18nData, message?: string | null) =>
		message || i18nData.subscribeFail,
	newsletterUnsubscribeSuccess: (i18nData: I18nData) => i18nData.unsubscribedSuccessfully,
	newsletterUnsubscribeFail: (i18nData: I18nData, message?: string | null) =>
		message || i18nData.unsubscribeFail,
	cartRemoveFailed: (i18nData: I18nData) => i18nData.cartRemoveFailed,
	cartUpdateFailed: (message: string | Translate) => resolveMessage(message, 'cartUpdateFailed'),
	wishlistUpdateFailed: (message: string | Translate) =>
		resolveMessage(message, 'wishlistUpdateFailed'),
	reviewAddFailed: (i18nData: I18nData) => i18nData.addReviewFail,
	reviewDeleteFailed: (message: string) => message,
	deleteAccountFailed: (message?: string | null, fallback?: string | Translate) =>
		message || resolveMessage(fallback ?? '', 'deleteFailed'),
	updateEmailFailed: (message: string) => message,
	nameUpdated: (i18nData: I18nData) => i18nData.nameUpdated,
	nameUpdateFailed: (i18nData: I18nData) => i18nData.editNameFail,
	notificationUpdated: (i18nData: I18nData) => i18nData.notifUpdated,
	notificationUpdateFailed: (i18nData: I18nData) => i18nData.preferedNotifFailed,
	emailUpdated: (i18nData: I18nData) => i18nData.emailUpdated,
	passwordUpdated: (i18nData: I18nData) => i18nData.passUpdated,
	phoneUpdated: (i18nData: I18nData) => i18nData.phoneUpdated,
	addressUpdated: (i18nData: I18nData) => i18nData.addressUpdated,
	addressUpdateFailed: (message: string | null | undefined, i18nData: I18nData) =>
		message || i18nData.editAddressFail || i18nData.invalidFormData,
};
