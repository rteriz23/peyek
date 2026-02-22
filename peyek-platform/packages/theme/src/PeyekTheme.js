/**
 * @rterizz23/peyek-theme
 * PeyekTheme — Dark/light theme manager with localStorage persistence
 *
 * Usage:
 *   import { PeyekTheme } from '@rterizz23/peyek-theme';
 *   PeyekTheme.init();           // Auto-detect system preference + apply saved choice
 *   PeyekTheme.toggle();         // Toggle between dark and light
 *   PeyekTheme.set('dark');      // Force dark mode
 *   PeyekTheme.get();            // Returns 'dark' | 'light'
 */
export class PeyekTheme {
    static #storageKey = 'peyek-theme';
    static #onChangeCallbacks = [];

    static #defaults = {
        dark: {
            '--bg': '#0a0a0f',
            '--bg-card': 'rgba(255,255,255,0.03)',
            '--text': '#f8fafc',
            '--text-muted': '#94a3b8',
            '--border': 'rgba(255,255,255,0.08)',
            '--primary': '#6366f1',
        },
        light: {
            '--bg': '#f8fafc',
            '--bg-card': 'rgba(0,0,0,0.03)',
            '--text': '#0f172a',
            '--text-muted': '#64748b',
            '--border': 'rgba(0,0,0,0.1)',
            '--primary': '#4f46e5',
        },
    };

    /**
     * Initialize the theme system.
     * @param {Object} [options]
     * @param {string} [options.default='dark'] - Default theme if none saved
     * @param {Object} [options.vars]           - Custom CSS variable overrides for each theme
     * @param {string} [options.attribute='data-theme'] - HTML attribute to set on <html>
     */
    static init(options = {}) {
        PeyekTheme.#storageKey = options.storageKey || 'peyek-theme';
        if (options.vars) {
            if (options.vars.dark) Object.assign(PeyekTheme.#defaults.dark, options.vars.dark);
            if (options.vars.light) Object.assign(PeyekTheme.#defaults.light, options.vars.light);
        }

        const saved = localStorage.getItem(PeyekTheme.#storageKey);
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = saved || system || options.default || 'dark';

        PeyekTheme.#apply(theme);

        // Watch system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(PeyekTheme.#storageKey)) {
                PeyekTheme.#apply(e.matches ? 'dark' : 'light');
            }
        });
    }

    /** Toggle between dark and light mode */
    static toggle() {
        PeyekTheme.set(PeyekTheme.get() === 'dark' ? 'light' : 'dark');
    }

    /** Force a specific theme */
    static set(theme) {
        if (!['dark', 'light'].includes(theme)) return;
        PeyekTheme.#apply(theme);
        localStorage.setItem(PeyekTheme.#storageKey, theme);
    }

    /** Get the current theme */
    static get() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    /** Register a callback to be called when theme changes */
    static onChange(cb) {
        PeyekTheme.#onChangeCallbacks.push(cb);
    }

    static #apply(theme) {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);

        const vars = PeyekTheme.#defaults[theme];
        if (vars) {
            Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
        }

        PeyekTheme.#onChangeCallbacks.forEach((cb) => cb(theme));
    }
}
