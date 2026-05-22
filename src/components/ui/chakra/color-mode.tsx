'use client';

import type { IconButtonProps } from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/react';
import * as React from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';

type ColorMode = 'light' | 'dark';
type ColorModePreference = ColorMode | 'system';

interface ColorModeProviderProps {
	children: React.ReactNode;
	defaultTheme?: ColorModePreference;
}

interface ColorModeContextValue {
	colorMode: ColorMode;
	setColorMode: (theme: ColorModePreference) => void;
}

const STORAGE_KEY = 'theme';
const ColorModeContext = React.createContext<ColorModeContextValue | null>(null);

function getSystemColorMode(): ColorMode {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveColorMode(preference: ColorModePreference): ColorMode {
	return preference === 'system' ? getSystemColorMode() : preference;
}

function applyColorMode(colorMode: ColorMode) {
	document.documentElement.classList.remove('light', 'dark');
	document.documentElement.classList.add(colorMode);
	document.documentElement.style.colorScheme = colorMode;
}

function getStoredPreference(defaultTheme: ColorModePreference): ColorModePreference {
	const storedTheme = window.localStorage.getItem(STORAGE_KEY);
	if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
		return storedTheme;
	}
	return defaultTheme;
}

export function ColorModeProvider({ children, defaultTheme = 'system' }: ColorModeProviderProps) {
	const [preference, setPreference] = React.useState<ColorModePreference>(defaultTheme);
	const [colorMode, setResolvedColorMode] = React.useState<ColorMode>('light');

	React.useEffect(() => {
		const storedPreference = getStoredPreference(defaultTheme);
		const resolvedColorMode = resolveColorMode(storedPreference);

		setPreference(storedPreference);
		setResolvedColorMode(resolvedColorMode);
		applyColorMode(resolvedColorMode);
	}, [defaultTheme]);

	React.useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleSystemColorModeChange = () => {
			if (preference !== 'system') return;

			const resolvedColorMode = getSystemColorMode();
			setResolvedColorMode(resolvedColorMode);
			applyColorMode(resolvedColorMode);
		};

		mediaQuery.addEventListener('change', handleSystemColorModeChange);
		return () => mediaQuery.removeEventListener('change', handleSystemColorModeChange);
	}, [preference]);

	const setColorMode = React.useCallback((theme: ColorModePreference) => {
		const resolvedColorMode = resolveColorMode(theme);

		window.localStorage.setItem(STORAGE_KEY, theme);
		setPreference(theme);
		setResolvedColorMode(resolvedColorMode);
		applyColorMode(resolvedColorMode);
	}, []);

	const value = React.useMemo(() => ({ colorMode, setColorMode }), [colorMode, setColorMode]);

	return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

function useColorMode() {
	const context = React.useContext(ColorModeContext);
	if (!context) {
		throw new Error('useColorMode must be used within ColorModeProvider');
	}

	const toggleColorMode = () => {
		context.setColorMode(context.colorMode === 'light' ? 'dark' : 'light');
	};
	return {
		colorMode: context.colorMode,
		setColorMode: context.setColorMode,
		toggleColorMode,
	};
}

function ColorModeIcon() {
	const { colorMode } = useColorMode();
	return colorMode === 'light' ? <LuSun /> : <LuMoon />;
}

interface ColorModeButtonProps extends Omit<IconButtonProps, 'aria-label'> {}

export const ColorModeButton = React.forwardRef<HTMLButtonElement, ColorModeButtonProps>(
	function ColorModeButton(props, ref) {
		const { toggleColorMode } = useColorMode();
		const [mounted, setMounted] = React.useState(false);

		React.useEffect(() => {
			setMounted(true);
		}, []);

		if (!mounted) {
			return (
				<span
					aria-hidden='true'
					style={{
						display: 'inline-block',
						width: '32px',
						height: '32px',
					}}
				/>
			);
		}

		return (
			<IconButton
				onClick={toggleColorMode}
				variant='ghost'
				aria-label='Toggle color mode'
				size='md'
				rounded='md'
				color='main.lightOnly'
				bg='transparent'
				_hover={{ bg: 'orange.400' }}
				ref={ref}
				{...props}
				css={{
					_icon: {
						width: '5',
						height: '5',
					},
				}}
			>
				<ColorModeIcon />
			</IconButton>
		);
	},
);
