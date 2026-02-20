/**
 * P.E.Y.E.K - Platform Extensible Yielding Engineering Kit
 */
import { Modal } from './modal.js';
import { API } from './api.js';
import * as Utils from './utils.js';

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

export const peyek = new PeyekCore();
