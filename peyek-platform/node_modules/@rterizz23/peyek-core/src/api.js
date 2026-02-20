/**
 * P.E.Y.E.K API Communication Layer
 * Yielding capability to work seamlessly with Yii/Laravel by easily providing CSRF tokens etc.
 */
export class API {
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
