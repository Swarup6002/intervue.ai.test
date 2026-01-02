/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
    darkMode: 'class',
    theme: {
        extend: {
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '400' }],
                sm: ['0.875rem', { lineHeight: '1.25', letterSpacing: '0.025em', fontWeight: '400' }],
                base: ['1rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '400' }],
                lg: ['1.125rem', { lineHeight: '1.75', letterSpacing: '-0.025em', fontWeight: '400' }],
                xl: ['1.25rem', { lineHeight: '1.75', letterSpacing: '-0.025em', fontWeight: '500' }],
                '2xl': ['1.5rem', { lineHeight: '2', letterSpacing: '-0.05em', fontWeight: '600' }],
                '3xl': ['1.875rem', { lineHeight: '2.25', letterSpacing: '-0.05em', fontWeight: '700' }],
                '4xl': ['2.25rem', { lineHeight: '2.5', letterSpacing: '-0.05em', fontWeight: '700' }],
                '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '800' }],
                '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '800' }],
                '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '900' }],
                '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '900' }],
                '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '900' }],
            },
            fontFamily: {
                heading: "poppins-v2",
                paragraph: "roboto"
            },
            colors: {
                accent: {
                    DEFAULT: '#00FFFF',
                    dark: '#00FFFF',
                    light: '#00BFFF',
                },
                destructive: '#FF4500',
                'destructive-foreground': '#FFFFFF',
                background: {
                    DEFAULT: '#0f0c29',
                    dark: '#0f0c29',
                    light: '#F5F5F7',
                },
                secondary: {
                    DEFAULT: '#24243e',
                    dark: '#24243e',
                    light: '#FFFFFF',
                },
                foreground: {
                    DEFAULT: '#FFFFFF',
                    dark: '#FFFFFF',
                    light: '#1A1A1A',
                },
                'secondary-foreground': '#FFFFFF',
                'primary-foreground': '#FFFFFF',
                primary: {
                    DEFAULT: '#302b63',
                    dark: '#302b63',
                    light: '#E8E8F0',
                }
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
