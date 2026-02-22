/**
 * @rterizz23/peyek-toast
 * PeyekToast — Zero-dependency toast notification system
 *
 * Usage:
 *   import { PeyekToast } from '@rterizz23/peyek-toast';
 *   PeyekToast.show({ message: 'Saved!', type: 'success' });
 *   PeyekToast.show({ message: 'Something went wrong.', type: 'error', duration: 5000 });
 */
export class PeyekToast {
    static #container = null;
    static #styles = false;

    static #init() {
        if (PeyekToast.#container) return;

        // Inject styles
        if (!PeyekToast.#styles) {
            const style = document.createElement('style');
            style.textContent = `
                #peyek-toast-container {
                    position: fixed; bottom: 24px; right: 24px;
                    display: flex; flex-direction: column; gap: 10px;
                    z-index: 99999; pointer-events: none;
                }
                .peyek-toast {
                    display: flex; align-items: center; gap: 12px;
                    min-width: 280px; max-width: 400px;
                    padding: 14px 18px;
                    border-radius: 12px;
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #f8fafc; font-family: Outfit, sans-serif; font-size: 14px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                    pointer-events: all; cursor: pointer;
                    animation: peyek-toast-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
                    transition: opacity 0.3s, transform 0.3s;
                }
                .peyek-toast.hiding {
                    animation: peyek-toast-out 0.3s ease forwards;
                }
                .peyek-toast.success { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.3); }
                .peyek-toast.error   { background: rgba(239,68,68,0.15);  border-color: rgba(239,68,68,0.3); }
                .peyek-toast.warning { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.3); }
                .peyek-toast.info    { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); }
                .peyek-toast-icon { font-size: 18px; flex-shrink: 0; }
                .peyek-toast-msg { flex: 1; line-height: 1.4; }
                .peyek-toast-close { opacity: 0.5; font-size: 18px; line-height: 1; flex-shrink: 0; }
                .peyek-toast-close:hover { opacity: 1; }
                @keyframes peyek-toast-in {
                    from { opacity: 0; transform: translateX(80px) scale(0.9); }
                    to   { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes peyek-toast-out {
                    from { opacity: 1; transform: translateX(0) scale(1); }
                    to   { opacity: 0; transform: translateX(80px) scale(0.9); }
                }
            `;
            document.head.appendChild(style);
            PeyekToast.#styles = true;
        }

        PeyekToast.#container = document.createElement('div');
        PeyekToast.#container.id = 'peyek-toast-container';
        document.body.appendChild(PeyekToast.#container);
    }

    static #iconFor(type) {
        return { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[type] || 'ℹ️';
    }

    /**
     * Show a toast notification.
     * @param {Object} opts
     * @param {string} opts.message          - The toast message text
     * @param {'success'|'error'|'warning'|'info'} [opts.type='info'] - Toast type
     * @param {number} [opts.duration=3500]  - Auto-dismiss duration in ms (0 = sticky)
     */
    static show({ message = '', type = 'info', duration = 3500 } = {}) {
        PeyekToast.#init();

        const toast = document.createElement('div');
        toast.className = `peyek-toast ${type}`;
        toast.innerHTML = `
            <span class="peyek-toast-icon">${PeyekToast.#iconFor(type)}</span>
            <span class="peyek-toast-msg">${message}</span>
            <span class="peyek-toast-close">×</span>
        `;

        const dismiss = () => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        };

        toast.querySelector('.peyek-toast-close').addEventListener('click', dismiss);
        toast.addEventListener('click', dismiss);

        PeyekToast.#container.appendChild(toast);

        if (duration > 0) setTimeout(dismiss, duration);
    }

    static success(message, duration) { PeyekToast.show({ message, type: 'success', duration }); }
    static error(message, duration) { PeyekToast.show({ message, type: 'error', duration }); }
    static warning(message, duration) { PeyekToast.show({ message, type: 'warning', duration }); }
    static info(message, duration) { PeyekToast.show({ message, type: 'info', duration }); }
}
