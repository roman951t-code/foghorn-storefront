import { useState } from 'react';
import { ApiClient, type ActionProps, useNotice, useTranslation } from 'adminjs';
import { Box, Button, Icon, MessageBox, Text } from '@adminjs/design-system';
import { useNavigate } from 'react-router';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

const api = new ApiClient();

const appendForceRefresh = (url: string) => {
	const searchParamsIdx = url.lastIndexOf('?');
	const urlSearchParams = searchParamsIdx !== -1 ? url.substring(searchParamsIdx + 1) : null;
	const params = new URLSearchParams(urlSearchParams ?? '');
	params.set('refresh', 'true');
	const baseUrl = searchParamsIdx !== -1 ? url.substring(0, searchParamsIdx) : url;
	return `${baseUrl}?${params.toString()}`;
};

export default function RecordDeleteAction({ action, record, resource }: ActionProps) {
	const [loading, setLoading] = useState(false);
	const addNotice = useNotice();
	const navigate = useNavigate();
	const isReadOnly = useIsReadOnlyAdmin();
	const { translateMessage } = useTranslation();

	if (!record) {
		return (
			<Box variant='white' p='xl'>
				<Text>{translateMessage('admin-record-id-required')}</Text>
			</Box>
		);
	}

	const handleDelete = async () => {
		setLoading(true);
		try {
			const response = await api.recordAction({
				resourceId: resource.id,
				recordId: record.id,
				actionName: action.name,
				method: 'post',
			});

			if (response.data.notice) {
				addNotice(response.data.notice);
			}
			if (response.data.redirectUrl) {
				navigate(appendForceRefresh(response.data.redirectUrl));
			}
		} catch {
			addNotice({ message: `${action.name}-failed`, type: 'error' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			variant='white'
			p='xxl'
			borderRadius='xl'
			boxShadow='sm'
			maxWidth='680px'
			style={{ border: '1px solid #E2E8F0' }}
		>
			<MessageBox
				mb='xl'
				variant='danger'
				message={translateMessage(action.guard || action.name, resource.id)}
			/>
			<Button
				variant='danger'
				size='lg'
				onClick={handleDelete}
				disabled={isReadOnly || loading}
			>
				{loading ? <Icon icon='Loader' spin /> : null}
				{translateMessage('confirm')}
			</Button>
		</Box>
	);
}
