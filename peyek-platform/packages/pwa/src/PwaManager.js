/**
 * @rterizz23/peyek-pwa
 * PwaManager — Instant PWA toolkit
 * Registers a service worker and an "Install App" prompt for any web project.
 *
 * Usage:
 *   import { PwaManager } from '@rterizz23/peyek-pwa';
 *   PwaManager.init({ name: 'My App', themeColor: '#6366f1' });
 */
export class PwaManager {
    static #deferredPrompt = null;
    static #config = {};

    /**
     * Initialize PWA: inject manifest link, register service worker,
     * listen for install prompt.
     *
     * @param {Object} options
     * @param {string} options.name        - App display name
     * @param {string} [options.themeColor='#6366f1'] - Theme color hex
     * @param {string} [options.swPath='/sw.js']      - Path to service worker file
     * @param {string} [options.scope='/']            - Service worker scope
     * @param {string} [options.startUrl='/']         - Start URL for manifest
     * @param {string} [options.display='standalone'] - Display mode
     */
    static init(options = {}) {
        PwaManager.#config = {
            name: options.name || 'P.E.Y.E.K App',
            themeColor: options.themeColor || '#6366f1',
            swPath: options.swPath || '/sw.js',
            scope: options.scope || '/',
            startUrl: options.startUrl || '/',
            display: options.display || 'standalone',
        };

        PwaManager.#injectManifestLink();
        PwaManager.#registerServiceWorker();
        PwaManager.#listenForInstallPrompt();
    }

    /**
     * Dynamically inject <link rel="manifest"> into <head>
     * Falls back to a data-URL encoded manifest if no external file exists.
     */
    static #injectManifestLink() {
        if (document.querySelector('link[rel="manifest"]')) return;

        const manifestData = {
            name: PwaManager.#config.name,
            short_name: PwaManager.#config.name.split(' ')[0],
            theme_color: PwaManager.#config.themeColor,
            background_color: '#0a0a0f',
            display: PwaManager.#config.display,
            start_url: PwaManager.#config.startUrl,
            icons: [
                { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            ],
        };

        const json = JSON.stringify(manifestData);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = url;
        document.head.appendChild(link);

        // Also set theme-color meta
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = PwaManager.#config.themeColor;
    }

    /**
     * Register the service worker at the configured path.
     */
    static #registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('[PeyekPWA] Service Worker not supported in this browser.');
            return;
        }

        navigator.serviceWorker
            .register(PwaManager.#config.swPath, { scope: PwaManager.#config.scope })
            .then((reg) => {
                console.log(`[PeyekPWA] Service Worker registered. Scope: ${reg.scope}`);
            })
            .catch((err) => {
                console.error('[PeyekPWA] Service Worker registration failed:', err);
            });
    }

    /**
     * Capture the beforeinstallprompt event so we can trigger it manually.
     */
    static #listenForInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            PwaManager.#deferredPrompt = e;
            window.dispatchEvent(new CustomEvent('peyek:pwa:installable'));
        });

        window.addEventListener('appinstalled', () => {
            PwaManager.#deferredPrompt = null;
            window.dispatchEvent(new CustomEvent('peyek:pwa:installed'));
        });
    }

    /**
     * Programmatically trigger the browser's "Add to Home Screen" prompt.
     * Listen for the 'peyek:pwa:installable' event to know when to show your button.
     *
     * @returns {Promise<'accepted'|'dismissed'|null>}
     */
    static async promptInstall() {
        if (!PwaManager.#deferredPrompt) {
            console.warn('[PeyekPWA] Install prompt not available yet or already used.');
            return null;
        }
        PwaManager.#deferredPrompt.prompt();
        const { outcome } = await PwaManager.#deferredPrompt.userChoice;
        PwaManager.#deferredPrompt = null;
        return outcome; // 'accepted' | 'dismissed'
    }

    /**
     * Returns true if the app is already installed (running in standalone mode).
     */
    static isInstalled() {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true
        );
    }

    /**
     * Generate a vanilla manifest.json object you can write to a file.
     * Useful for server-side generation or CLI scaffolding.
     *
     * @param {Object} options - Same as init() options
     * @returns {Object} manifest JSON object
     */
    static generateManifest(options = {}) {
        return {
            name: options.name || 'P.E.Y.E.K App',
            short_name: (options.name || 'P.E.Y.E.K App').split(' ')[0],
            description: options.description || 'Built with P.E.Y.E.K Platform',
            theme_color: options.themeColor || '#6366f1',
            background_color: options.bgColor || '#0a0a0f',
            display: options.display || 'standalone',
            orientation: 'portrait-primary',
            start_url: options.startUrl || '/',
            scope: options.scope || '/',
            lang: options.lang || 'en',
            icons: options.icons || [
                { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
                { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
                { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
                { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
            shortcuts: options.shortcuts || [],
        };
    }
}
