import React, { type ReactElement } from 'react';
import { stringify } from 'qs';
import {
	type ActionResponse,
	type ActionJSON,
	buildActionTestId,
	getActionElementCss,
	useAction,
	useCurrentAdmin,
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
	const isReadOnly = (currentAdmin as { role?: string } | null)?.role === 'readonly';
	const shouldDisable = isReadOnly && action?.hasHandler && isImmediateAction(action);

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

	const contentTag = getActionElementCss(resourceId, action.name, 'button');
	const baseChild = firstChild as ReactElement<any>;
	const baseStyle = baseChild.props?.style ?? {};

	const onClick = shouldDisable
		? (event: any) => {
				event?.preventDefault?.();
				event?.stopPropagation?.();
		  }
		: handleClick;

	return React.cloneElement(baseChild, {
		onClick,
		'data-testid': buildActionTestId(action),
		'data-css': contentTag,
		href: shouldDisable ? undefined : href,
		disabled: shouldDisable || baseChild.props?.disabled,
		'aria-disabled': shouldDisable || baseChild.props?.['aria-disabled'],
		title: baseChild.props?.title ?? (shouldDisable ? 'Read-only account: changes are disabled.' : undefined),
		style: shouldDisable
			? { ...baseStyle, pointerEvents: 'none', opacity: 0.6, cursor: 'not-allowed' }
			: baseStyle,
	});
}

