/**
 * P.E.Y.E.K Content Protection Module v1.0
 *
 * Protects:
 *  1. Creator photo — rendered to <canvas>, cannot be right-click saved
 *  2. HTML content — disables right-click, text selection, drag
 *  3. DevTools shortcuts — F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I/J/C
 *  4. Image drag-and-drop stealing
 *  5. Print screen / CSS print protection
 *  6. DevTools detection via dimension change
 *
 * NOTE: This is obfuscation-level protection. Browser must render content,
 * so 100% encryption of served HTML is technically impossible. These layers
 * make casual theft significantly harder.
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CREATOR PHOTO — Render via Canvas
//    The photo is loaded onto a <canvas> element. Canvas renders pixels,
//    not a saveable <img> — right-click "Save Image As" is disabled on canvas.
//    A transparent overlay div blocks drag, touch-copy, and context menu.
// ═══════════════════════════════════════════════════════════════════════════════
function renderPhotoOnCanvas() {
    const wrap = document.querySelector('.creator-photo-wrap');
    if (!wrap) return;

    // Remove the original <img> element
    const img = wrap.querySelector('img.creator-photo');
    if (!img) return;

    const photoSrc = img.getAttribute('src');

    // Create canvas to replace img
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    canvas.className = 'creator-photo-canvas';
    canvas.setAttribute('aria-label', 'Ruly Rizki Perdana — Creator of PEYEK');
    canvas.setAttribute('role', 'img');

    // Load image onto canvas
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
        const ctx = canvas.getContext('2d');

        // Circular clip for the circular photo effect
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 100, 97, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw photo
        ctx.drawImage(image, 0, 0, 200, 200);

        // Subtle watermark — very faint diagonal text (A02: integrity)
        ctx.restore();
        ctx.globalAlpha = 0.04;
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 10px Outfit, sans-serif';
        ctx.textAlign = 'center';
        for (let i = -1; i <= 3; i++) {
            ctx.save();
            ctx.translate(100, 100);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText('PEYEK © 2026', 0, i * 40);
            ctx.restore();
        }
        ctx.globalAlpha = 1;

        // Circular border stroke (matches CSS)
        ctx.beginPath();
        ctx.arc(100, 100, 97, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99,102,241,0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
    };
    image.onerror = () => {
        // Fallback: draw gradient avatar with initials
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 200, 200);
        grad.addColorStop(0, '#6366f1');
        grad.addColorStop(1, '#ec4899');
        ctx.beginPath();
        ctx.arc(100, 100, 97, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 52px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('RRP', 100, 105);
        ctx.beginPath();
        ctx.arc(100, 100, 97, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99,102,241,0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
    };
    image.src = photoSrc;

    // Replace img with canvas
    img.replaceWith(canvas);

    // Transparent overlay — blocks right-click and drag on canvas
    const shield = document.createElement('div');
    shield.className = 'creator-photo-shield';
    shield.setAttribute('aria-hidden', 'true');
    shield.addEventListener('contextmenu', e => e.preventDefault());
    shield.addEventListener('dragstart', e => e.preventDefault());
    shield.addEventListener('mousedown', e => { if (e.button === 2) e.preventDefault(); });
    wrap.appendChild(shield);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. HTML CONTENT PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════
function initContentProtection() {

    // 2a. Disable right-click globally
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showProtectToast();
        return false;
    });

    // 2b. Disable image drag
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
            e.preventDefault();
        }
    });

    // 2c. Block DevTools keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const forbidden = (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) ||
            (e.ctrlKey && e.key.toUpperCase() === 'U') ||  // View Source
            (e.ctrlKey && e.key.toUpperCase() === 'S') ||  // Save Page
            (e.ctrlKey && e.key.toUpperCase() === 'P')     // Print
        );
        if (forbidden) {
            e.preventDefault();
            e.stopPropagation();
            showProtectToast();
            return false;
        }
    });

    // 2d. Disable text selection on sensitive content
    document.querySelectorAll('.creator-name, .creator-certs, .creator-desc').forEach(el => {
        el.style.userSelect = 'none';
        el.style.webkitUserSelect = 'none';
        el.addEventListener('copy', e => e.preventDefault());
    });

    // 2e. Disable copy on specific elements
    document.querySelectorAll('.creator-card').forEach(el => {
        el.addEventListener('copy', e => e.preventDefault());
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DEVTOOLS DETECTION (dimension-change method)
//    When DevTools is open, window inner dimensions change.
//    We blur sensitive content if DevTools is likely open.
// ═══════════════════════════════════════════════════════════════════════════════
let _devToolsOpen = false;

function checkDevTools() {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const likely = widthDiff > threshold || heightDiff > threshold;

    if (likely && !_devToolsOpen) {
        _devToolsOpen = true;
        // Blur creator photo canvas when DevTools detected
        const canvas = document.querySelector('.creator-photo-canvas');
        if (canvas) canvas.style.filter = 'blur(8px)';
        console.clear();
        console.log('%c⛔ PEYEK Security Notice', 'color:#ef4444;font-size:20px;font-weight:bold');
        console.log('%cThis application is protected. Unauthorized inspection is prohibited.', 'color:#94a3b8;font-size:13px');
    } else if (!likely && _devToolsOpen) {
        _devToolsOpen = false;
        const canvas = document.querySelector('.creator-photo-canvas');
        if (canvas) canvas.style.filter = '';
    }
}

setInterval(checkDevTools, 1500);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CSS PRINT PROTECTION — handled in CSS via @media print
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Toast notification for protection trigger
// ═══════════════════════════════════════════════════════════════════════════════
let _toastVisible = false;
function showProtectToast() {
    if (_toastVisible) return;
    _toastVisible = true;

    const toast = document.createElement('div');
    toast.className = 'protect-toast';
    toast.textContent = '🔒 Konten ini dilindungi hak cipta.';
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => { toast.remove(); _toastVisible = false; }, 400);
    }, 2200);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Console branding (replaces any injected messages)
// ═══════════════════════════════════════════════════════════════════════════════
function printConsoleBrand() {
    console.log('%c P.E.Y.E.K ', 'background:#6366f1;color:#fff;font-size:18px;font-weight:bold;border-radius:6px;padding:4px 12px');
    console.log('%cBuilt with ❤️  by Ruly Rizki Perdana | https://github.com/rteriz23/peyek', 'color:#6366f1');
    console.log('%c⚠️  This site is protected. Unauthorized scraping or copying is prohibited.', 'color:#f59e0b;font-weight:bold');
}

// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initContentProtection();
        renderPhotoOnCanvas();
        printConsoleBrand();
    });
} else {
    initContentProtection();
    renderPhotoOnCanvas();
    printConsoleBrand();
}
