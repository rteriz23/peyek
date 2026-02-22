/**
 * @rterizz23/peyek-charts
 * PeyekCharts — Zero-dependency charts via Canvas API
 *
 * Usage:
 *   import { PeyekCharts } from '@rterizz23/peyek-charts';
 *   PeyekCharts.line('#myCanvas', { labels: ['Jan','Feb'], data: [10, 20] });
 *   PeyekCharts.bar('#myCanvas', { labels: ['A','B','C'], data: [5, 15, 10] });
 *   PeyekCharts.donut('#myCanvas', { labels: ['X','Y'], data: [60, 40], colors: ['#6366f1','#ec4899'] });
 */
export class PeyekCharts {
    static #defaults = {
        lineColor: '#6366f1',
        barColor: '#6366f1',
        textColor: '#94a3b8',
        bgColor: 'rgba(99,102,241,0.08)',
        fontFamily: 'Outfit, sans-serif',
        padding: 48,
    };

    static #getCanvas(selector) {
        const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!el || el.tagName !== 'CANVAS') throw new Error(`[PeyekCharts] No canvas found: ${selector}`);
        return { canvas: el, ctx: el.getContext('2d') };
    }

    /** Draw an animated line chart */
    static line(selector, { labels = [], data = [], color, title = '' } = {}) {
        const { canvas, ctx } = PeyekCharts.#getCanvas(selector);
        const W = canvas.width, H = canvas.height;
        const pad = PeyekCharts.#defaults.padding;
        const col = color || PeyekCharts.#defaults.lineColor;
        const max = Math.max(...data) * 1.2 || 1;
        const steps = data.length - 1 || 1;
        const xStep = (W - pad * 2) / steps;
        const yScale = (H - pad * 2) / max;

        ctx.clearRect(0, 0, W, H);
        PeyekCharts.#drawGrid(ctx, W, H, pad, labels, data, max);

        // Line + fill
        ctx.beginPath();
        data.forEach((v, i) => {
            const x = pad + i * xStep;
            const y = H - pad - v * yScale;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Fill under line
        ctx.lineTo(pad + steps * xStep, H - pad);
        ctx.lineTo(pad, H - pad);
        ctx.closePath();
        ctx.fillStyle = PeyekCharts.#defaults.bgColor;
        ctx.fill();

        // Dots
        data.forEach((v, i) => {
            const x = pad + i * xStep;
            const y = H - pad - v * yScale;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = col;
            ctx.fill();
        });

        if (title) PeyekCharts.#drawTitle(ctx, title, W);
    }

    /** Draw a bar chart */
    static bar(selector, { labels = [], data = [], color, title = '' } = {}) {
        const { canvas, ctx } = PeyekCharts.#getCanvas(selector);
        const W = canvas.width, H = canvas.height;
        const pad = PeyekCharts.#defaults.padding;
        const col = color || PeyekCharts.#defaults.barColor;
        const max = Math.max(...data) * 1.2 || 1;
        const n = data.length;
        const totalW = W - pad * 2;
        const barW = (totalW / n) * 0.6;
        const gap = (totalW / n) * 0.4;

        ctx.clearRect(0, 0, W, H);
        PeyekCharts.#drawGrid(ctx, W, H, pad, labels, data, max);

        data.forEach((v, i) => {
            const x = pad + i * (barW + gap) + gap / 2;
            const barH = (v / max) * (H - pad * 2);
            const y = H - pad - barH;

            // Bar with rounded top
            const r = Math.min(6, barW / 2);
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + barW - r, y);
            ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
            ctx.lineTo(x + barW, H - pad);
            ctx.lineTo(x, H - pad);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fillStyle = col;
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        if (title) PeyekCharts.#drawTitle(ctx, title, W);
    }

    /** Draw a donut chart */
    static donut(selector, { labels = [], data = [], colors, title = '' } = {}) {
        const { canvas, ctx } = PeyekCharts.#getCanvas(selector);
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;
        const radius = Math.min(W, H) / 2 - 32;
        const inner = radius * 0.55;
        const total = data.reduce((s, v) => s + v, 0) || 1;
        const defaultColors = ['#6366f1', '#ec4899', '#22d3ee', '#f59e0b', '#10b981'];
        let angle = -Math.PI / 2;

        ctx.clearRect(0, 0, W, H);

        data.forEach((v, i) => {
            const slice = (v / total) * Math.PI * 2;
            const col = (colors && colors[i]) || defaultColors[i % defaultColors.length];

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, angle, angle + slice);
            ctx.closePath();
            ctx.fillStyle = col;
            ctx.fill();

            // Donut hole
            ctx.beginPath();
            ctx.arc(cx, cy, inner, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0a0f';
            ctx.fill();

            angle += slice;
        });

        // Center text
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold 18px ${PeyekCharts.#defaults.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title || `${data.length}`, cx, cy);

        // Legend
        labels.forEach((lbl, i) => {
            const col = (colors && colors[i]) || defaultColors[i % defaultColors.length];
            const ly = H - 20 - (labels.length - 1 - i) * 22;
            ctx.beginPath();
            ctx.arc(28, ly, 6, 0, Math.PI * 2);
            ctx.fillStyle = col;
            ctx.fill();
            ctx.fillStyle = PeyekCharts.#defaults.textColor;
            ctx.font = `13px ${PeyekCharts.#defaults.fontFamily}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${lbl} (${Math.round((data[i] / total) * 100)}%)`, 42, ly);
        });
    }

    static #drawGrid(ctx, W, H, pad, labels, data, max) {
        const gridLines = 5;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.font = `12px ${PeyekCharts.#defaults.fontFamily}`;
        ctx.fillStyle = PeyekCharts.#defaults.textColor;

        for (let i = 0; i <= gridLines; i++) {
            const y = pad + ((H - pad * 2) / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(pad, y);
            ctx.lineTo(W - pad, y);
            ctx.stroke();
            const val = Math.round(max - (max / gridLines) * i);
            ctx.textAlign = 'right';
            ctx.fillText(val, pad - 8, y + 4);
        }

        labels.forEach((lbl, i) => {
            const xStep = (W - pad * 2) / (labels.length - 1 || 1);
            const x = pad + i * xStep;
            ctx.textAlign = 'center';
            ctx.fillText(lbl, x, H - pad + 18);
        });
    }

    static #drawTitle(ctx, title, W) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold 14px ${PeyekCharts.#defaults.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText(title, W / 2, 20);
    }
}
