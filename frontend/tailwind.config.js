/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                bg: 'var(--bg)',
                surface: 'var(--surface)',
                card: 'var(--card)',
                border: 'var(--border)',
                accent: 'var(--accent)',
                accent2: 'var(--accent2)',
                accent3: 'var(--accent3)',
                muted: 'var(--muted)',
                dim: 'var(--dim)',
                gold: 'var(--gold)',
                info: 'var(--info)',
            },
            fontFamily: {
                sans: ['Syne', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
};