type UserAdminStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
type RestrictedUserAdminStatus = Exclude<UserAdminStatus, 'ACTIVE'>;

const REASON_WHITESPACE = /\s+/g;

export const isRestrictedUserAdminStatus = (
	status: UserAdminStatus | string | null | undefined
): status is RestrictedUserAdminStatus => status === 'SUSPENDED' || status === 'BLOCKED';

const normalizeAdminNotes = (value: string | null | undefined): string | null => {
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
