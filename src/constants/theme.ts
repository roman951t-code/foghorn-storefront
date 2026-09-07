// Shared between the server-rendered no-flash <Script> in layout.tsx and the
// client-side ColorModeProvider — must live outside any 'use client' module,
// since importing even a plain constant from a client module into a Server
// Component resolves to an unusable server reference, not the string value.
export const THEME_STORAGE_KEY = 'theme';
