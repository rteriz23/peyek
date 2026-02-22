/**
 * PWA Controller
 * Dynamically generates a manifest.json for any P.E.Y.E.K project.
 */
export class PwaController {

    /**
     * GET /api/pwa/manifest
     * Query params: ?name=MyApp&color=%236366f1&bg=%230a0a0f&start=/&display=standalone&lang=en
     */
    static manifest(req, res) {
        const {
            name = 'P.E.Y.E.K App',
            color = '#6366f1',
            bg = '#0a0a0f',
            start = '/',
            scope = '/',
            display = 'standalone',
            lang = 'en',
            description = 'Built with P.E.Y.E.K Platform',
        } = req.query;

        const shortName = name.split(' ').slice(0, 2).join('');

        const manifest = {
            name,
            short_name: shortName.length > 12 ? shortName.slice(0, 12) : shortName,
            description,
            lang,
            theme_color: color,
            background_color: bg,
            display,
            start_url: start,
            scope,
            orientation: 'portrait-primary',
            icons: [
                { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
                { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
                { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
                { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
            shortcuts: [],
            categories: ['productivity', 'utilities'],
            _generator: 'P.E.Y.E.K SaaS Backend v1.5.0',
        };

        res.setHeader('Content-Type', 'application/manifest+json');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.json(manifest);
    }
}
