import crypto from 'crypto';

/**
 * Analytics Controller
 *
 * In-memory analytics store.
 * Replace with PostgreSQL/MongoDB in production.
 */
const store = {
    visits: [],        // Array of visit objects
    uniqueIPs: new Set(),
};

export class AnalyticsController {

    /**
     * POST /api/analytics/track
     * Body: { page: string, referrer?: string, ua?: string }
     */
    static track(req, res) {
        const { page = '/', referrer = '', ua = '' } = req.body;

        // Get visitor IP (respects proxies)
        const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 12);

        store.uniqueIPs.add(ipHash);
        store.visits.push({
            page,
            referrer,
            ua: ua.slice(0, 200),
            ipHash,
            ts: new Date().toISOString(),
        });

        // Keep last 10,000 visits in memory
        if (store.visits.length > 10000) store.visits.shift();

        return res.json({ tracked: true, totalVisits: store.visits.length });
    }

    /**
     * GET /api/analytics/stats
     * Returns aggregate analytics data
     */
    static stats(req, res) {
        const { visits, uniqueIPs } = store;

        // Top pages
        const pageCounts = {};
        visits.forEach(({ page }) => {
            pageCounts[page] = (pageCounts[page] || 0) + 1;
        });
        const topPages = Object.entries(pageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([page, count]) => ({ page, count }));

        // Top referrers
        const refCounts = {};
        visits.filter(v => v.referrer).forEach(({ referrer }) => {
            try {
                const host = new URL(referrer).hostname;
                refCounts[host] = (refCounts[host] || 0) + 1;
            } catch { /* skip malformed */ }
        });
        const topReferrers = Object.entries(refCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([referrer, count]) => ({ referrer, count }));

        // Visits in last 24h
        const dayAgo = Date.now() - 86400000;
        const last24h = visits.filter(v => new Date(v.ts).getTime() > dayAgo).length;

        // Recent visits (last 5, no PII)
        const recentVisits = visits
            .slice(-5)
            .reverse()
            .map(({ page, referrer, ts }) => ({ page, referrer, ts }));

        return res.json({
            totalVisits: visits.length,
            uniqueVisitors: uniqueIPs.size,
            last24h,
            topPages,
            topReferrers,
            recentVisits,
            uptime: process.uptime(),
            generatedAt: new Date().toISOString(),
        });
    }
}
