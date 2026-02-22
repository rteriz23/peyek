/**
 * P.E.Y.E.K Website Script v1.5.1 — OWASP Security Hardened
 *
 * Security additions (OWASP Top 10):
 *  A03 Injection         — xssSafe() escapes all dynamic DOM content
 *  A03 Injection         — sanitizeInput() strips dangerous patterns
 *  A07 Auth Failures     — analytics ping rate-limited (max 1/5min per session)
 *  A05 Misconfiguration  — strict fetch() with timeout + status validation
 *  A09 Monitoring        — console.warn on security anomalies
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// A03: XSS-Safe DOM Helper
// NEVER use innerHTML with user-supplied data. Use this instead.
// ═══════════════════════════════════════════════════════════════════════════════
const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };

function xssSafe(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"'/]/g, c => ESCAPE_MAP[c] || c);
}

// A03: Sanitize user-sourced strings (strip script/event patterns)
function sanitizeInput(str, maxLen = 512) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>/g, '')              // strip HTML tags
        .replace(/javascript:/gi, '')          // strip JS URIs
        .replace(/on\w+\s*=/gi, '')            // strip event handlers
        .replace(/[\u0000-\u001F\u007F]/g, '') // strip control characters
        .trim()
        .slice(0, maxLen);
}

// A07: Analytics ping rate limiter — max once per 5 minutes per session
let _lastPingTime = 0;
const PING_THROTTLE_MS = 5 * 60 * 1000;

// A05: Fetch wrapper with timeout and response validation
async function secureFetch(url, options = {}, timeoutMs = 6000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const resp = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const ct = resp.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error('Non-JSON response');
        return resp.json();
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

// ─── PWA Service Worker ──────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(r => console.log('[PEYEK] SW registered:', r.scope))
            .catch(e => console.warn('[PEYEK] SW failed:', e));
    });
}

// ─── PWA Install Prompt ──────────────────────────────────────────────────────
let deferredInstallPrompt = null;
const installBtn = document.getElementById('pwa-install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installBtn) installBtn.style.display = 'inline-flex';
});

installBtn?.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') installBtn.style.display = 'none';
    deferredInstallPrompt = null;
});

window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.style.display = 'none';
    deferredInstallPrompt = null;
});

// ─── Mobile Nav ──────────────────────────────────────────────────────────────
const hamburger = document.getElementById('nav-hamburger');
const navLinks = document.getElementById('nav-links');
const overlay = document.getElementById('mobile-nav-overlay');

function closeNav() {
    hamburger?.classList.remove('open');
    navLinks?.classList.remove('open');
    overlay?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
    const isOpen = navLinks?.classList.toggle('open');
    hamburger.classList.toggle('open');
    overlay?.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
});
overlay?.addEventListener('click', closeNav);
navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

// ─── Navbar Scroll Effect ────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── Copy Snippet Button (A03: use textContent, not innerHTML for user data) ──
function copySnippet(btn) {
    // Only copy from a safe data-value attribute or code element text — never eval
    const text = sanitizeInput(btn.dataset.value || btn.previousElementSibling?.textContent || '');
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        // Safe: we use known static SVG, not user input
        const orig = btn.innerHTML;
        btn.innerHTML = '<svg width="18" height="18" fill="none" stroke="#27c93f" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        setTimeout(() => { btn.innerHTML = orig; }, 1800);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
    });
}
window.copySnippet = copySnippet;

// ─── Animated Counters ───────────────────────────────────────────────────────
function animateCounter(el, target) {
    // Validate target is a safe number (A03)
    const safeTarget = Number.isFinite(+target) ? Math.abs(Math.round(+target)) : 0;
    const duration = 1800;
    const startTime = performance.now();

    function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        // Use textContent — NEVER innerHTML for dynamic values (A03)
        el.textContent = formatNum(Math.round(safeTarget * ease));
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function formatNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

// ─── npm Download Count (A05: secure fetch with timeout) ───────────────────
async function fetchNpmStats() {
    const packages = [
        '@rterizz23/peyek-core', '@rterizz23/peyek-ui-builder', '@rterizz23/peyek-pdf-viewer',
        '@rterizz23/peyek-pwa', '@rterizz23/peyek-charts', '@rterizz23/peyek-table',
        '@rterizz23/peyek-form', '@rterizz23/peyek-toast', '@rterizz23/peyek-theme',
    ];

    let total = 0;
    try {
        const results = await Promise.allSettled(
            packages.map(pkg => {
                // A03: encode package name to prevent URL injection
                const safeUrl = `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(pkg)}`;
                return secureFetch(safeUrl, {}, 5000).catch(() => ({ downloads: 0 }));
            })
        );
        total = results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? (r.value?.downloads || 0) : 0), 0);
    } catch { /* silently fail */ }

    const el = document.getElementById('stat-downloads');
    if (el) {
        // A03: use textContent not innerHTML
        el.textContent = total > 0 ? formatNum(total) : '—';
    }
}

// ─── Visitor Analytics Ping (A07: rate-limited, A03: sanitized payload) ──────
async function pingAnalytics() {
    const now = Date.now();
    if (now - _lastPingTime < PING_THROTTLE_MS) return; // rate guard
    _lastPingTime = now;

    const BACKEND = 'http://localhost:3000'; // Update to deployed URL

    // A03: sanitize all values before sending
    const payload = {
        page: sanitizeInput(window.location.pathname, 256),
        referrer: sanitizeInput(document.referrer, 256),
        ua: sanitizeInput(navigator.userAgent, 200),
    };

    try {
        const data = await secureFetch(`${BACKEND}/api/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const el = document.getElementById('stat-visitors');
        if (el && Number.isFinite(data?.totalVisits)) {
            animateCounter(el, data.totalVisits);
        }
    } catch {
        const el = document.getElementById('stat-visitors');
        if (el) el.textContent = '—';
    }
}

// ─── IntersectionObserver for Stats Counters ─────────────────────────────────
const statsSection = document.getElementById('stats');
let countersStarted = false;

if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !countersStarted) {
            countersStarted = true;
            observer.disconnect();

            document.querySelectorAll('[data-counter="static"]').forEach(el => {
                animateCounter(el, parseInt(el.dataset.target || '0', 10));
            });

            fetchNpmStats();
            pingAnalytics();
        }
    }, { threshold: 0.3 });
    observer.observe(statsSection);
}

// ─── A09: Detect and log suspicious URL parameters ────────────────────────────
(function auditUrl() {
    const dangerous = [/<script/i, /javascript:/i, /on\w+=/i, /\.\.\//];
    const full = window.location.href;
    if (dangerous.some(p => p.test(full))) {
        console.warn('[PEYEK SECURITY] Suspicious URL detected:', xssSafe(window.location.search));
        // Strip and redirect to clean path (A03)
        history.replaceState(null, '', window.location.pathname);
    }
})();
