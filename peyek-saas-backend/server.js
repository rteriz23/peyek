import express from 'express';

// Security Middleware — OWASP Top 10
import {
    corsMiddleware,
    helmetMiddleware,
    globalRateLimit,
    analyticsRateLimit,
    sanitizeMiddleware,
    bodySizeGuard,
    securityLogger,
    methodGuard,
} from './middleware/security.js';

// Route modules
import { LicenseController } from './controllers/LicenseController.js';
import analyticsRoutes from './routes/analytics.js';
import packagesRoutes from './routes/packages.js';
import pwaRoutes from './routes/pwa.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware Stack (ORDER MATTERS) ────────────────────────────────
app.set('trust proxy', 1);      // Trust first proxy (for accurate IP in rate limiter)
app.use(helmetMiddleware);       // A05: 15+ security headers via Helmet
app.use(corsMiddleware);         // A01: Whitelist CORS origins
app.use(methodGuard);           // A01: Block TRACE/CONNECT/PUT/DELETE etc.
app.use(globalRateLimit);       // A06/A07: 100 req/min per IP globally
app.use(securityLogger);        // A09: Log suspicious requests (SQLi/XSS/traversal)
app.use(bodySizeGuard);         // A03: Block >8KB request bodies early
app.use(express.json({ limit: '8kb' })); // A03: JSON body limit
app.use(sanitizeMiddleware);    // A03: Strip XSS/injection patterns from body+query

// Request logger (non-security)
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ─── Core Routes ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'OK',
        service: 'peyek-saas-backend',
        version: '1.5.1',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        security: 'OWASP-Top10-Hardened',
    });
});

// License
app.post('/api/license/generate', LicenseController.generate);
app.post('/api/license/verify', LicenseController.verify);

// ─── Feature Routes ───────────────────────────────────────────────────────────
// Analytics: tighter rate limit on write endpoint
app.use('/api/analytics', analyticsRateLimit, analyticsRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/pwa', pwaRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found', service: 'peyek-saas-backend' });
});

// ─── Global Error Handler (A09) ───────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(`[ERROR] ${new Date().toISOString()}:`, err.message);
    // Never expose stack traces to client
    res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🔒 [P.E.Y.E.K SaaS v1.5.1] OWASP-Hardened Backend`);
    console.log(`   🌐 http://localhost:${PORT}`);
    console.log(`\n   Security layers active:`);
    console.log(`   ✅ Helmet.js (15+ headers)`);
    console.log(`   ✅ Whitelist CORS`);
    console.log(`   ✅ Rate Limiting (100/min global, 30/min analytics)`);
    console.log(`   ✅ Input Sanitization (XSS/SQLi filter)`);
    console.log(`   ✅ Body Size Guard (8KB max)`);
    console.log(`   ✅ Suspicious Request Logger`);
    console.log(`   ✅ HTTP Method Guard\n`);
    console.log(`   Endpoints:`);
    console.log(`   GET  /api/health`);
    console.log(`   POST /api/license/generate`);
    console.log(`   POST /api/license/verify`);
    console.log(`   POST /api/analytics/track`);
    console.log(`   GET  /api/analytics/stats`);
    console.log(`   GET  /api/packages/downloads`);
    console.log(`   GET  /api/pwa/manifest\n`);
});
