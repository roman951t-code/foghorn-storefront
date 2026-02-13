import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default [
	...nextVitals,
	...nextTypescript,
	{
		ignores: [
			'.adminjs/**',
			'src/generated/**',
			'coverage/**',
			'public/adminjs-readonly.js',
			'scripts/**/*.cjs',
		],
	},
	{
		rules: {
			'import/no-anonymous-default-export': 'off',
			'react-hooks/set-state-in-effect': 'off',
			'react-hooks/refs': 'off',
			'react-hooks/incompatible-library': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
		},
	},
	{
		files: ['**/*.{ts,tsx,mts,cts}'],
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_|^e$|^err$|^error$',
					caughtErrors: 'none',
					destructuredArrayIgnorePattern: '^_',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^_',
				},
			],
		},
	},
];
