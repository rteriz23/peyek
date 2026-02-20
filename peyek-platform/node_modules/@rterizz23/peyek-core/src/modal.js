import { createElement, generateUniqueId } from './utils.js';

/**
 * CSS injected for modals
 */
const MODAL_CSS = `
  .peyek-modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(2px);
  }
  .peyek-modal-overlay.peyek-modal-show {
    opacity: 1;
  }
  .peyek-modal-content {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    transform: scale(0.95) translateY(20px);
    transition: transform 0.3s ease;
  }
  .peyek-modal-overlay.peyek-modal-show .peyek-modal-content {
    transform: scale(1) translateY(0);
  }
  .peyek-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  .peyek-modal-title {
    margin: 0;
    font-size: 1.25rem;
    color: #333;
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 600;
  }
  .peyek-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    line-height: 1;
  }
  .peyek-modal-close:hover {
    color: #333;
  }
  .peyek-modal-body {
    font-family: system-ui, -apple-system, sans-serif;
    color: #555;
    line-height: 1.6;
  }
`;

/**
 * P.E.Y.E.K Auto Modal System
 */
export class Modal {
    static initStyles() {
        if (!document.getElementById('peyek-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'peyek-modal-styles';
            style.textContent = MODAL_CSS;
            document.head.appendChild(style);
        }
    }

    /**
     * Shows a modal dialog dynamically
     * @param {Object} options 
     * @param {string} options.title
     * @param {string|HTMLElement} options.content
     * @param {boolean} [options.closeOnClickOutside=true]
     * @returns {string} modalId
     */
    static show(options = {}) {
        this.initStyles();

        const { title = 'Alert', content = '', closeOnClickOutside = true } = options;
        const modalId = generateUniqueId();

        const overlay = createElement('div', {
            id: modalId,
            className: 'peyek-modal-overlay'
        });

        const modalBox = createElement('div', { className: 'peyek-modal-content' });

        const header = createElement('div', { className: 'peyek-modal-header' }, [
            createElement('h2', { className: 'peyek-modal-title' }, [title]),
            createElement('button', {
                className: 'peyek-modal-close',
                innerHTML: '&times;', // HTML entity for multiplication sign, works well as close button
                onClick: () => this.close(modalId)
            })
        ]);

        const body = createElement('div', { className: 'peyek-modal-body' });
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }

        modalBox.appendChild(header);
        modalBox.appendChild(body);
        overlay.appendChild(modalBox);

        if (closeOnClickOutside) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close(modalId);
                }
            });
        }

        document.body.appendChild(overlay);

        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('peyek-modal-show');
        });

        return modalId;
    }

    /**
     * Closes an active modal
     * @param {string} modalId 
     */
    static close(modalId) {
        const overlay = document.getElementById(modalId);
        if (!overlay) return;

        overlay.classList.remove('peyek-modal-show');

        // Wait for animation to finish before removing
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300); // 300ms matches CSS transition
    }
}
