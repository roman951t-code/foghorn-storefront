export type AppSessionUser = {
	id: string;
	email: string | null;
	name: string | null;
	emailVerified?: boolean | null;
	phoneNumber?: string | null;
	phoneNumberVerified?: boolean | null;
	lastName?: string | null;
	middleName?: string | null;
	notificationMethod?: string | null;
	subscribed?: boolean;
	shippingCountry?: string | null;
	shippingRegion?: string | null;
	shippingCity?: string | null;
	shippingPostalCode?: string | null;
	shippingAddressLine1?: string | null;
	shippingAddressLine2?: string | null;
	isGoogleUser?: boolean;
	[key: string]: unknown;
};

export type AppSession =
	| {
			session: Record<string, unknown> | null;
			user: AppSessionUser;
			[key: string]: unknown;
	  }
	| null;

export type AppSessionResponse = AppSession | { data?: AppSession | null } | null;
