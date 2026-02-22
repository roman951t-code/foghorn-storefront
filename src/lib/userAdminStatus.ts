export type UserAdminStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
export type RestrictedUserAdminStatus = Exclude<UserAdminStatus, 'ACTIVE'>;
export type UserRestrictionErrorCode = 'account_suspended' | 'account_blocked';

const REASON_WHITESPACE = /\s+/g;

export const isRestrictedUserAdminStatus = (
	status: UserAdminStatus | string | null | undefined
): status is RestrictedUserAdminStatus => status === 'SUSPENDED' || status === 'BLOCKED';

export const toUserRestrictionErrorCode = (
	status: RestrictedUserAdminStatus
): UserRestrictionErrorCode => (status === 'SUSPENDED' ? 'account_suspended' : 'account_blocked');

export const normalizeAdminNotes = (value: string | null | undefined): string | null => {
	if (typeof value !== 'string') return null;
	const normalized = value.trim().replace(REASON_WHITESPACE, ' ');
	return normalized.length > 0 ? normalized : null;
};

export const buildUserRestrictionMessage = ({
	status,
	notes,
	accountSuspended,
	accountBlocked,
	formatReason,
}: {
	status: RestrictedUserAdminStatus;
	notes: string | null | undefined;
	accountSuspended: string;
	accountBlocked: string;
	formatReason: (reason: string) => string;
}): string => {
	const baseMessage = status === 'SUSPENDED' ? accountSuspended : accountBlocked;
	const reason = normalizeAdminNotes(notes);

	if (!reason) return baseMessage;
	return `${baseMessage} ${formatReason(reason)}`;
};
