import { useCurrentAdmin } from 'adminjs';

export function useIsReadOnlyAdmin() {
	const [currentAdmin] = useCurrentAdmin();
	return (currentAdmin as { role?: string } | null)?.role === 'readonly';
}

