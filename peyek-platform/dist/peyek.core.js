(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PeyekCore = {}));
})(this, (function (exports) { 'use strict';

    /**
     * P.E.Y.E.K Core Utilities
     */

    /**
     * Creates an HTML element with attributes and children.
     * @param {string} tag
     * @param {Object} attributes
     * @param {Array<HTMLElement|string>} children
     * @returns {HTMLElement}
     */
    function createElement(tag, attributes = {}, children = []) {
        const el = document.createElement(tag);

        for (const [key, value] of Object.entries(attributes)) {
            if (key.startsWith('on') && typeof value === 'function') {
                const event = key.substring(2).toLowerCase();
                el.addEventListener(event, value);
            } else if (key === 'className') {
                el.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else {
                el.setAttribute(key, value);
            }
        }

        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                el.appendChild(child);
            }
        });

        return el;
    }

    /**
     * Generates a unique ID
     * @returns {string}
     */
    function generateUniqueId() {
        return 'peyek_' + Math.random().toString(36).substr(2, 9);
    }

    var Utils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createElement: createElement,
        generateUniqueId: generateUniqueId
    });

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
    class Modal {
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

    /**
     * P.E.Y.E.K API Communication Layer
     * Yielding capability to work seamlessly with Yii/Laravel by easily providing CSRF tokens etc.
     */
    class API {
        static defaults = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        /**
         * Set global CSRF token that will be sent with all requests
         * @param {string} token 
         * @param {string} headerName (default: 'X-CSRF-TOKEN' for Laravel/CI)
         */
        static setCsrfToken(token, headerName = 'X-CSRF-TOKEN') {
            this.defaults.headers[headerName] = token;
        }

        /**
         * Validate a P.E.Y.E.K license key remotely
         * @param {string} licenseKey
         */
        static async verifyLicense(licenseKey) {
            // In production this would point to the actual SaaS domain (e.g. api.peyek.com)
            const backendURL = 'http://localhost:3000/api/license/verify';
            return fetch(backendURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey, origin: window.location.origin })
            }).then(res => res.json());
        }

        /**
         * Perform an auto-configured GET request
         * @param {string} url 
         * @param {Object} options 
         */
        static async get(url, options = {}) {
            return this.request(url, { ...options, method: 'GET' });
        }

        /**
         * Perform an auto-configured POST request
         * @param {string} url 
         * @param {Object} data 
         * @param {Object} options 
         */
        static async post(url, data = {}, options = {}) {
            return this.request(url, {
                ...options,
                method: 'POST',
                body: JSON.stringify(data)
            });
        }

        /**
         * Base request method
         */
        static async request(url, options = {}) {
            try {
                const finalOptions = {
                    ...options,
                    headers: {
                        ...this.defaults.headers,
                        ...(options.headers || {})
                    }
                };

                const response = await fetch(url, finalOptions);

                const isJson = response.headers.get('content-type')?.includes('application/json');
                const data = isJson ? await response.json() : await response.text();

                if (!response.ok) {
                    throw { status: response.status, data };
                }

                return data;
            } catch (error) {
                console.error('[P.E.Y.E.K API Error]', error);
                throw error;
            }
        }
    }

    /**
     * P.E.Y.E.K - Platform Extensible Yielding Engineering Kit
     */

    class PeyekCore {
        constructor() {
            this.Modal = Modal;
            this.API = API;
            this.Utils = Utils;
            this.version = '1.0.0';
            this.licenseKey = null;
            this.isPremium = false;
        }

        /**
         * Initialize peyek by detecting global framework properties like CSRF
         */
        async init(options = {}) {
            console.log(`[P.E.Y.E.K] Core initialized v${this.version}`);

            // Check for a license
            if (options.license) {
                await this.verifyLicense(options.license);
            }

            // Auto-detect Laravel/Yii CSRF tokens from meta tags if available
            this.autoDetectCsrf();
        }

        /**
         * Contact the SaaS backend to activate premium features
         */
        async verifyLicense(key) {
            console.log('[P.E.Y.E.K] Validating license key...');
            try {
                const result = await this.API.verifyLicense(key);
                if (result.valid) {
                    this.licenseKey = key;
                    this.isPremium = true;
                    console.log('%c[P.E.Y.E.K Premium Enabled]', 'color: #27c93f; font-weight: bold;');
                } else {
                    console.warn('[P.E.Y.E.K] Invalid License: ' + result.error);
                }
            } catch (e) {
                console.warn('[P.E.Y.E.K] Could not reach activation server.');
            }
        }

        autoDetectCsrf() {
            const laravelToken = document.querySelector('meta[name="csrf-token"]');
            if (laravelToken) {
                this.API.setCsrfToken(laravelToken.getAttribute('content'));
                console.log('[P.E.Y.E.K] Auto-detected Laravel CSRF token');
            }

            // Typical Yii2 csrf token structure
            const yiiToken = document.querySelector('meta[name="csrf-param"]');
            const yiiTokenValue = document.querySelector('meta[name="csrf-token"]');
            // For Yii we usually send it in data or specific header, but this sets a baseline.
            if (yiiToken && yiiTokenValue) {
                this.API.setCsrfToken(yiiTokenValue.getAttribute('content'), 'X-CSRF-Token');
                console.log('[P.E.Y.E.K] Auto-detected Yii CSRF token');
            }
        }
    }

    const peyek = new PeyekCore();

    exports.API = API;
    exports.Modal = Modal;
    exports.Utils = Utils;
    exports.default = peyek;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=peyek.core.js.map
