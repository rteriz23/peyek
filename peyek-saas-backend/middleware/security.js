/**
 * P.E.Y.E.K Security Middleware
 * OWASP Top 10 hardening for the Express.js SaaS backend.
 *
 * Covers:
 *  A01 Broken Access Control       — CORS whitelist + HTTP method guard
 *  A02 Cryptographic Failures      — HTTPS enforcement (HSTS header)
 *  A03 Injection                   — Input sanitization + length limits
 *  A05 Security Misconfiguration   — Helmet.js security headers
 *  A06 Vulnerable Components       — Rate limiting
 *  A07 Auth Failures               — Rate limit on all endpoints
 *  A09 Logging & Monitoring        — Suspicious request logger
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ─── Allowed Origins ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'https://peyek.pcode.my.id',
];

/**
 * CORS — A01: Broken Access Control
 * Only allow whitelisted origins.
 */
export function corsMiddleware(req, res, next) {
    const origin = req.headers.origin || '';
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Max-Age', '86400');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
}

/**
 * Helmet — A05: Security Misconfiguration
 * Sets 15+ security response headers.
 */
export const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Relax for npm API proxy
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: false,
    xssFilter: true,
    hidePoweredBy: true,
});

/**
 * Global Rate Limiter — A06/A07
 * Max 100 requests/minute per IP.
 */
export const globalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' },
    skip: (req) => req.method === 'OPTIONS',
});

/**
 * Strict Rate Limiter for analytics write endpoint — A07
 * Max 30 requests/minute per IP.
 */
export const analyticsRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Analytics rate limit exceeded.' },
});

/**
 * DOM/JSON Injection Sanitizer — A03: Injection
 * Strips dangerous characters from string values in req.body / req.query.
 */
const DANGEROUS = /<\s*script|javascript:|on\w+\s*=|<\s*\/?\s*(iframe|object|embed|link|meta)/gi;

function sanitizeValue(val) {
    if (typeof val === 'string') {
        return val.replace(DANGEROUS, '').slice(0, 2048); // max 2KB per field
    }
    return val;
}

function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const clean = {};
    for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'object' && val !== null) {
            clean[key] = sanitizeObject(val);
        } else {
            clean[key] = sanitizeValue(val);
        }
    }
    return clean;
}

export function sanitizeMiddleware(req, _res, next) {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    next();
}

/**
 * Request Body Size Guard — A03: Injection
 * Blocks oversized bodies before JSON parsing.
 */
export function bodySizeGuard(req, res, next) {
    let size = 0;
    req.on('data', chunk => {
        size += chunk.length;
        if (size > 8192) { // 8KB max
            res.status(413).json({ error: 'Request payload too large.' });
            req.destroy();
        }
    });
    next();
}

/**
 * Suspicious Request Logger — A09: Logging & Monitoring
 */
const SUSPICIOUS_PATTERNS = [
    /('|--|;|\/\*|\*\/|xp_|exec\s*\()/i,  // SQL injection
    /(<|%3C).*script/i,                     // XSS
    /\.\.\//,                               // Path traversal
    /(union|select|insert|drop|delete|update)\s/i, // SQL keywords
];

export function securityLogger(req, _res, next) {
    const url = req.url + JSON.stringify(req.query);
    const body = JSON.stringify(req.body || {});

    const isSuspicious = SUSPICIOUS_PATTERNS.some(p => p.test(url) || p.test(body));
    if (isSuspicious) {
        const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
        console.warn(`[SECURITY ⚠️] ${new Date().toISOString()} | ${req.method} ${req.url} | IP: ${ip}`);
    }
    next();
}

/**
 * HTTP Method Guard — A01: Broken Access Control
 */
export function methodGuard(req, res, next) {
    const ALLOWED = ['GET', 'POST', 'OPTIONS', 'HEAD'];
    if (!ALLOWED.includes(req.method)) {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }
    next();
}
