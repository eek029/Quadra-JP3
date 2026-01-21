/**
 * Theme Tokens
 * Central theme configuration for Quadra-JP3
 * Purple gradient: #667eea -> #764ba2
 */

export const colors = {
    purple: {
        light: '#667eea',
        dark: '#764ba2',
        50: '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#667eea',
        600: '#764ba2',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
    },
} as const;

export const gradients = {
    purple: 'linear-gradient(135deg, #667eea, #764ba2)',
    purpleHover: 'linear-gradient(135deg, #764ba2, #667eea)',
    purpleRadial: 'radial-gradient(circle at top left, #667eea, #764ba2)',
} as const;

export const spacing = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
} as const;

export const borderRadius = {
    sm: '0.375rem',
    md: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
} as const;

export const shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    purple: '0 10px 40px -10px rgba(102, 126, 234, 0.5)',
} as const;

export const transitions = {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
} as const;
