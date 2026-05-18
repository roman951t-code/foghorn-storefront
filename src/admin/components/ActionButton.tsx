import React, { type ReactElement } from 'react';
import { stringify } from 'qs';
import {
	ApiClient,
	type ActionResponse,
	type ActionJSON,
	buildActionTestId,
	useAction,
	useCurrentAdmin,
	useNotice,
	useTranslation,
} from 'adminjs';

type Props = {
	action: ActionJSON;
	resourceId: string;
	recordId?: string;
	recordIds?: string[];
	actionPerformed?: (action: ActionResponse) => any;
	children?: React.ReactNode;
	search?: string;
	queryParams?: Record<string, unknown>;
};

const isImmediateAction = (action: ActionJSON) => action.component === false || action.component == null;
const api = new ApiClient();
const POST_IMMEDIATE_ACTIONS = new Set([
	'archiveProduct',
	'bulkMarkDelivered',
	'bulkMarkShipped',
	'deleteProduct',
	'duplicateBanner',
	'duplicateProduct',
	'markDelivered',
	'markPaid',
	'markShipped',
	'publishProduct',
]);

const appendForceRefresh = (url: string) => {
	const searchParamsIdx = url.lastIndexOf('?');
	const urlSearchParams = searchParamsIdx !== -1 ? url.substring(searchParamsIdx + 1) : null;
	const params = new URLSearchParams(urlSearchParams ?? '');
	params.set('refresh', 'true');
	const baseUrl = searchParamsIdx !== -1 ? url.substring(0, searchParamsIdx) : url;
	return `${baseUrl}?${params.toString()}`;
};

export default function ActionButton(props: Props) {
	const {
		children,
		action,
		actionPerformed,
		resourceId,
		recordId,
		recordIds,
		search,
		queryParams,
	} = props;

	const [currentAdmin] = useCurrentAdmin();
	const { translateMessage } = useTranslation();
	const addNotice = useNotice();
	const isReadOnly = (currentAdmin as { role?: string } | null)?.role === 'readonly';
	const shouldDisable = isReadOnly && action?.hasHandler && isImmediateAction(action);
	const shouldSubmitImmediatePost =
		!shouldDisable &&
		action?.hasHandler &&
		isImmediateAction(action) &&
		POST_IMMEDIATE_ACTIONS.has(action.name);

	const { href, handleClick } = useAction(
		action,
		{
			resourceId,
			recordId,
			recordIds,
			search: stringify(queryParams, { addQueryPrefix: true }) || search,
		},
		actionPerformed
	);

	if (!action) return null;

	const firstChild = React.Children.toArray(children)[0];

	if (
		!firstChild ||
		typeof firstChild === 'string' ||
		typeof firstChild === 'number' ||
		typeof firstChild === 'boolean'
	) {
		throw new Error('ActionButton has to have one child');
	}

	const contentTag = [resourceId, action.name, 'button'].join('-');
	const baseChild = firstChild as ReactElement<any>;
	const baseStyle = baseChild.props?.style ?? {};

	const handleImmediatePost = async (event: any) => {
		event?.preventDefault?.();
		event?.stopPropagation?.();

		if (action.guard && !window.confirm(translateMessage(action.guard, resourceId))) {
			return;
		}

		try {
			const response = recordIds?.length
				? await api.bulkAction({
						resourceId,
						recordIds,
						actionName: action.name,
						method: 'post',
					})
				: recordId
					? await api.recordAction({
							resourceId,
							recordId,
							actionName: action.name,
							method: 'post',
						})
					: await api.resourceAction({
							resourceId,
							actionName: action.name,
							method: 'post',
						});

			actionPerformed?.(response.data as ActionResponse);
			if (response.data.notice) {
				addNotice(response.data.notice);
			}
			if (response.data.redirectUrl) {
				window.location.assign(appendForceRefresh(response.data.redirectUrl));
			}
		} catch {
			addNotice({ message: `${action.name}-failed`, type: 'error' });
		}
	};

	const onClick = shouldDisable
		? (event: any) => {
				event?.preventDefault?.();
				event?.stopPropagation?.();
		  }
		: shouldSubmitImmediatePost
			? handleImmediatePost
		: handleClick;

	return React.cloneElement(baseChild, {
		onClick,
		'data-testid': buildActionTestId(action),
		'data-css': contentTag,
		href: shouldDisable ? undefined : href,
		disabled: shouldDisable || baseChild.props?.disabled,
		'aria-disabled': shouldDisable || baseChild.props?.['aria-disabled'],
		title:
			baseChild.props?.title ??
			(shouldDisable ? translateMessage('readonly-account-disabled') : undefined),
		style: shouldDisable
			? { ...baseStyle, pointerEvents: 'none', opacity: 0.6, cursor: 'not-allowed' }
			: baseStyle,
	});
}
