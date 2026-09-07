import type { PropertyOptions } from 'adminjs';

export const hidden: PropertyOptions = { isVisible: false };
export const readOnly: PropertyOptions = { isVisible: { edit: false } };
export const disabled: PropertyOptions = { isDisabled: true };

export const readOnlyActions = {
	new: { isAccessible: false },
	edit: { isAccessible: false },
	delete: { isAccessible: false },
	bulkDelete: { isAccessible: false },
};
