import { useEffect, useMemo, useRef, useState } from 'react';
import {
	Box,
	Button,
	DrawerContent,
	DrawerFooter,
	Icon,
	MessageBox,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Text,
} from '@adminjs/design-system';
import { useNavigate } from 'react-router';
import {
	ApiClient,
	BasePropertyComponent,
	type ActionProps,
	useNotice,
	useTranslation,
} from 'adminjs';
import { useIsReadOnlyAdmin } from '../hooks/useIsReadOnlyAdmin';

const appendForceRefresh = (url: string, search?: string) => {
	const searchParamsIdx = url.lastIndexOf('?');
	const urlSearchParams = searchParamsIdx !== -1 ? url.substring(searchParamsIdx + 1) : null;
	const oldParams = new URLSearchParams(search ?? urlSearchParams ?? window.location.search ?? '');
	const newParams = new URLSearchParams(oldParams.toString());
	newParams.set('refresh', 'true');
	const newUrl = searchParamsIdx !== -1 ? url.substring(0, searchParamsIdx) : url;
	return `${newUrl}?${newParams.toString()}`;
};

export default function BulkDelete(props: ActionProps) {
	const { resource, records, action } = props;
	const navigate = useNavigate();
	const addNotice = useNotice();
	const [loading, setLoading] = useState(false);
	const isReadOnly = useIsReadOnlyAdmin();
	const { translateMessage, translateButton } = useTranslation();
	const contentRef = useRef<HTMLElement | null>(null);
	const footerRef = useRef<HTMLElement | null>(null);

	const closeDrawer = useMemo(
		() => () => {
			const search = new URLSearchParams(window.location.search);
			search.delete('recordIds');
			const target = appendForceRefresh(resource.href ?? '/', search.toString());
			navigate(target);
		},
		[navigate, resource.href]
	);

	useEffect(() => {
		if (!action?.showInDrawer) return;
		const onMouseDown = (event: MouseEvent) => {
			const target = event.target as Node | null;
			if (!target) return;
			const insideContent = contentRef.current?.contains(target);
			const insideFooter = footerRef.current?.contains(target);
			if (!insideContent && !insideFooter) {
				closeDrawer();
			}
		};
		document.addEventListener('mousedown', onMouseDown);
		return () => document.removeEventListener('mousedown', onMouseDown);
	}, [action?.showInDrawer, closeDrawer]);

	if (!records) {
		return <Text>{translateMessage('pickSomeFirstToRemove', resource.id)}</Text>;
	}

	const handleClick = () => {
		const api = new ApiClient();
		setLoading(true);
		const recordIds = records.map((record) => record.id);
		api
			.bulkAction({
				resourceId: resource.id,
				actionName: action.name,
				recordIds,
				method: 'post',
			})
			.then((response) => {
				setLoading(false);
				if (response.data.notice) {
					addNotice(response.data.notice);
				}
				if (response.data.redirectUrl) {
					const search = new URLSearchParams(window.location.search);
					search.delete('recordIds');
					navigate(appendForceRefresh(response.data.redirectUrl, search.toString()));
				}
			})
			.catch((error) => {
				setLoading(false);
				addNotice({ message: translateMessage('bulkDeleteError', resource.id), type: 'error' });
				throw error;
			});
	};

	return (
		<>
			<DrawerContent ref={contentRef as any}>
				<Box display='flex' justifyContent='flex-end' mb='lg'>
					<Button type='button' variant='light' size='icon' color='text' onClick={closeDrawer}>
						<Icon icon='X' />
					</Button>
				</Box>
				<MessageBox
					mb='xxl'
					variant='danger'
					message={translateMessage(
						records.length > 1 ? 'theseRecordsWillBeRemoved_plural' : 'theseRecordsWillBeRemoved',
						resource.id,
						{ count: records.length }
					)}
				/>
				<Table>
					<TableBody>
						{records.map((record) => (
							<TableRow key={record.id}>
								<TableCell>
									<BasePropertyComponent
										where='list'
										property={resource.titleProperty}
										resource={resource}
										record={record}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</DrawerContent>
			<DrawerFooter ref={footerRef as any}>
				<Button variant='contained' size='lg' onClick={handleClick} disabled={isReadOnly || loading}>
					{loading ? <Icon icon='Loader' spin /> : null}
					{translateButton(
						records.length > 1 ? 'confirmRemovalMany_plural' : 'confirmRemovalMany',
						resource.id,
						{ count: records.length }
					)}
				</Button>
			</DrawerFooter>
		</>
	);
}
