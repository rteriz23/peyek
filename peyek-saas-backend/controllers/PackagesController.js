/**
 * Packages Controller
 * Proxies npm registry API to return download counts for all peyek packages.
 */

const PEYEK_PACKAGES = [
    '@rterizz23/peyek-core',
    '@rterizz23/peyek-ui-builder',
    '@rterizz23/peyek-pdf-viewer',
    '@rterizz23/peyek-pwa',
    '@rterizz23/peyek-charts',
    '@rterizz23/peyek-table',
    '@rterizz23/peyek-form',
    '@rterizz23/peyek-toast',
    '@rterizz23/peyek-theme',
];

// Simple TTL cache: refresh every 30 minutes
let cache = null;
let cacheExpiry = 0;
const CACHE_TTL = 30 * 60 * 1000;

export class PackagesController {

    /**
     * GET /api/packages/downloads
     * Returns npm download counts for all peyek packages combined + per package
     */
    static async downloads(req, res) {
        try {
            const now = Date.now();
            if (cache && now < cacheExpiry) {
                return res.json({ ...cache, fromCache: true });
            }

            const results = await Promise.allSettled(
                PEYEK_PACKAGES.map(async (pkg) => {
                    const url = `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(pkg)}`;
                    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
                    if (!resp.ok) return { package: pkg, downloads: 0 };
                    const data = await resp.json();
                    return { package: pkg, downloads: data.downloads || 0 };
                })
            );

            const packages = results.map((r, i) =>
                r.status === 'fulfilled' ? r.value : { package: PEYEK_PACKAGES[i], downloads: 0 }
            );

            const totalDownloads = packages.reduce((sum, p) => sum + p.downloads, 0);

            cache = {
                totalDownloads,
                packages,
                period: 'last-month',
                generatedAt: new Date().toISOString(),
            };
            cacheExpiry = now + CACHE_TTL;

            return res.json({ ...cache, fromCache: false });

        } catch (err) {
            console.error('[PackagesController] Error fetching npm stats:', err.message);
            return res.status(500).json({ error: 'Failed to fetch package download stats.' });
        }
    }
}
