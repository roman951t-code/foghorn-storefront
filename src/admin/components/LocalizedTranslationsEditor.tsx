import { useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
import { flat, type EditPropertyProps } from 'adminjs';
import { Box, Button, FormGroup, Input, Label, Text } from '@adminjs/design-system';
import {
	ADMIN_DEFAULT_TRANSLATION_LOCALE,
	ADMIN_TRANSLATION_LOCALES,
	buildTranslationInputPath,
	type AdminTranslationLocale,
	type LocalizedFieldDefinition,
} from '../constants/localization';

type EditorCustomConfig = {
	defaultLocale?: AdminTranslationLocale;
	locales?: AdminTranslationLocale[];
	fields?: LocalizedFieldDefinition[];
	title?: string;
};

const normalizeString = (value: unknown): string => {
	if (typeof value !== 'string') return '';
	return value;
};

const localeLabel = (locale: AdminTranslationLocale) =>
	locale === 'uk' ? 'Українська' : 'English';

const EMPTY_LOCALIZED_FIELDS: LocalizedFieldDefinition[] = [];

export default function LocalizedTranslationsEditor(props: EditPropertyProps) {
	const { property, record, onChange } = props;
	const custom = (property.custom ?? {}) as EditorCustomConfig;
	const defaultLocale = custom.defaultLocale ?? ADMIN_DEFAULT_TRANSLATION_LOCALE;
	const locales =
		custom.locales && custom.locales.length > 0
			? custom.locales
			: [...ADMIN_TRANSLATION_LOCALES];
	const fields = custom.fields ?? EMPTY_LOCALIZED_FIELDS;

	const [activeLocale, setActiveLocale] = useState<AdminTranslationLocale>(defaultLocale);

	const errors = (record?.errors ?? {}) as Record<string, { message?: unknown; type?: unknown }>;
	const valuesByField = useMemo(() => {
		const result: Record<string, string> = {};
		for (const field of fields) {
			const path = buildTranslationInputPath(activeLocale, field.key);
			result[field.key] = normalizeString(flat.get(record.params, path));
		}
		return result;
	}, [activeLocale, fields, record.params]);

	if (fields.length === 0) return null;

	return (
		<FormGroup mb='xl'>
			<Label>{custom.title ?? 'Localized Content'}</Label>
			<Text color='grey60' mb='lg'>
				Use Ukrainian as required default locale. English is optional.
			</Text>

			<Box style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
				{locales.map((locale) => {
					const isActive = activeLocale === locale;
					return (
						<Button
							key={locale}
							type='button'
							size='sm'
							variant={isActive ? 'contained' : 'outlined'}
							color='primary'
							onClick={(event: MouseEvent<HTMLButtonElement>) => {
								event.preventDefault();
								event.stopPropagation();
								setActiveLocale(locale);
							}}
						>
							{localeLabel(locale)}
						</Button>
					);
				})}
			</Box>

			<Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
				{fields.map((field) => {
					const path = buildTranslationInputPath(activeLocale, field.key);
					const isRequired =
						field.requiredInDefaultLocale && activeLocale === defaultLocale;
					const errorMessage = errors[path]?.message;

					return (
						<Box key={path}>
							<Label>
								{field.label}
								{isRequired ? ' *' : ''}
							</Label>
							{field.input === 'textarea' ? (
								<textarea
									value={valuesByField[field.key] ?? ''}
									rows={field.key === 'content' ? 8 : 3}
									style={{
										width: '100%',
										border: '1px solid #CBD5E1',
										borderRadius: 6,
										padding: 10,
										resize: 'vertical',
										font: 'inherit',
									}}
									onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
										onChange(path, event.target.value);
									}}
								/>
							) : (
								<Input
									value={valuesByField[field.key] ?? ''}
									onChange={(event: ChangeEvent<HTMLInputElement>) => {
										onChange(path, event.target.value);
									}}
								/>
							)}
							{typeof errorMessage === 'string' && errorMessage.length > 0 ? (
								<Text color='error' mt='sm'>
									{errorMessage}
								</Text>
							) : null}
						</Box>
					);
				})}
			</Box>
		</FormGroup>
	);
}
