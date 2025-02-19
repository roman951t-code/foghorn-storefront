'use client';

import { Button, Input, SimpleGrid } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { useForm } from 'react-hook-form';

interface FormValues {
	email: string;
	phone: string;
	firstName: string;
	lastName: string;
}

interface Props {
	submitText: string;
	emailLabel: string;
	phoneLabel: string;
	firstNameLabel: string;
	lastNameLabel: string;
}

export default function ContactForm({
	submitText,
	emailLabel,
	phoneLabel,
	firstNameLabel,
	lastNameLabel,
}: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		mode: 'onSubmit',
	});

	const onSubmit = handleSubmit(async (data) => {
		try {
			console.log('Form Submitted:', data);
		} catch (error) {
			console.error('Submission failed:', error);
		}
	});

	return (
		<form onSubmit={onSubmit}>
			<SimpleGrid
				className='productsSlider'
				columns={{ base: 1, sm: 2, md: 1, lg: 2 }}
				gap='4'
				w='100%'
				my='4'
			>
				<Field label={emailLabel} invalid={!!errors.email} errorText={errors.email?.message}>
					<Input
						{...register('email', {
							pattern: {
								value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
								message: 'Invalid email address',
							},
						})}
					/>
				</Field>

				<Field label={phoneLabel} invalid={!!errors.phone} errorText={errors.phone?.message}>
					<Input
						{...register('phone', {
							pattern: {
								value: /^\+?[0-9]{10,15}$/,
								message: 'Invalid phone number',
							},
						})}
					/>
				</Field>

				<Field
					label={firstNameLabel}
					invalid={!!errors.firstName}
					errorText={errors.firstName?.message}
				>
					<Input
						{...register('firstName', {
							minLength: { value: 2, message: 'First name must be at least 2 characters' },
						})}
					/>
				</Field>

				<Field
					label={lastNameLabel}
					invalid={!!errors.lastName}
					errorText={errors.lastName?.message}
				>
					<Input
						{...register('lastName', {
							minLength: { value: 2, message: 'Last name must be at least 2 characters' },
						})}
					/>
				</Field>
			</SimpleGrid>
			<Button
				w={{ base: '100%', sm: '240px' }}
				bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				color='black'
				variant='solid'
				mt='4'
			>
				{submitText}
			</Button>
		</form>
	);
}
