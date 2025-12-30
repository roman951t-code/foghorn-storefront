export const GLOBAL_ERROR_MESSAGES = {
	en: {
		title: 'Something went wrong',
		description: 'An unexpected error occurred. Please try again.',
		tryAgain: 'Try again',
	},
	uk: {
		title: 'Сталася помилка',
		description: 'Виникла непередбачена помилка. Спробуйте ще раз.',
		tryAgain: 'Спробувати ще раз',
	},
} as const;

export const GLOBAL_NOT_FOUND_MESSAGES = {
	en: {
		title: 'Page not found',
		description: 'We could not find the page you are looking for.',
		goHome: 'Go home',
	},
	uk: {
		title: 'Сторінку не знайдено',
		description: 'Ми не змогли знайти сторінку, яку ви шукаєте.',
		goHome: 'На головну',
	},
} as const;
