/**
 * @rterizz23/peyek-form
 * PeyekForm — Schema-driven smart form builder with validation
 *
 * Usage:
 *   import { PeyekForm } from '@rterizz23/peyek-form';
 *   PeyekForm.build({
 *     target: '#myForm',
 *     fields: [
 *       { name: 'email', type: 'email', label: 'Email Address', required: true },
 *       { name: 'message', type: 'textarea', label: 'Message', minLength: 10 },
 *       { name: 'role', type: 'select', label: 'Role', options: ['Admin', 'User', 'Guest'] },
 *     ],
 *     onSubmit: async (data) => { await saveToAPI(data); },
 *     submitLabel: 'Send Message',
 *   });
 */
export class PeyekForm {
    static #styles = false;

    static #injectStyles() {
        if (PeyekForm.#styles) return;
        const s = document.createElement('style');
        s.textContent = `
            .peyek-form { display: flex; flex-direction: column; gap: 20px; font-family: Outfit, sans-serif; }
            .peyek-form-field { display: flex; flex-direction: column; gap: 6px; }
            .peyek-form-label { font-size: 13px; font-weight: 600; color: #94a3b8; }
            .peyek-form-label .req { color: #f87171; margin-left: 2px; }
            .peyek-form input, .peyek-form textarea, .peyek-form select {
                padding: 10px 14px; border-radius: 8px;
                background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
                color: #f8fafc; font-size: 14px; outline: none; font-family: inherit;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .peyek-form input:focus, .peyek-form textarea:focus, .peyek-form select:focus {
                border-color: rgba(99,102,241,0.5);
                box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
            }
            .peyek-form input.peyek-error, .peyek-form textarea.peyek-error, .peyek-form select.peyek-error {
                border-color: rgba(239,68,68,0.5);
            }
            .peyek-form textarea { resize: vertical; min-height: 100px; }
            .peyek-form select option { background: #1e1e2e; }
            .peyek-form-error { font-size: 12px; color: #f87171; margin-top: 2px; }
            .peyek-form-submit {
                padding: 12px 24px; border-radius: 8px; border: none;
                background: #6366f1; color: #fff; font-weight: 600; font-size: 15px;
                cursor: pointer; font-family: inherit; transition: all 0.2s;
                display: flex; align-items: center; justify-content: center; gap: 8px;
            }
            .peyek-form-submit:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
            .peyek-form-submit:disabled { opacity: 0.5; cursor: not-allowed; }
            .peyek-form-submit .spinner {
                width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
                border-top-color: #fff; border-radius: 50%; animation: peyek-spin 0.6s linear infinite;
            }
            @keyframes peyek-spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(s);
        PeyekForm.#styles = true;
    }

    /**
     * Build and render a form in the target container.
     * @param {Object} config
     * @param {string|HTMLElement} config.target - CSS selector or element
     * @param {Array} config.fields              - Field definitions
     * @param {Function} config.onSubmit         - Async callback(data: Object)
     * @param {string} [config.submitLabel='Submit'] - Submit button text
     * @returns {{ getData: Function, reset: Function }}
     */
    static build({ target, fields = [], onSubmit, submitLabel = 'Submit' } = {}) {
        PeyekForm.#injectStyles();
        const container = typeof target === 'string' ? document.querySelector(target) : target;
        if (!container) throw new Error(`[PeyekForm] Target not found: ${target}`);

        const form = document.createElement('form');
        form.className = 'peyek-form';
        form.noValidate = true;

        fields.forEach((field) => {
            const wrap = document.createElement('div');
            wrap.className = 'peyek-form-field';

            const label = document.createElement('label');
            label.className = 'peyek-form-label';
            label.htmlFor = `pf-${field.name}`;
            label.innerHTML = `${field.label || field.name}${field.required ? '<span class="req">*</span>' : ''}`;
            wrap.appendChild(label);

            let input;
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
            } else if (field.type === 'select') {
                input = document.createElement('select');
                (field.options || []).forEach((opt) => {
                    const o = document.createElement('option');
                    o.value = typeof opt === 'object' ? opt.value : opt;
                    o.textContent = typeof opt === 'object' ? opt.label : opt;
                    input.appendChild(o);
                });
            } else {
                input = document.createElement('input');
                input.type = field.type || 'text';
            }
            input.id = `pf-${field.name}`;
            input.name = field.name;
            input.placeholder = field.placeholder || '';
            if (field.value !== undefined) input.value = field.value;

            const errEl = document.createElement('span');
            errEl.className = 'peyek-form-error';
            wrap.appendChild(input);
            wrap.appendChild(errEl);
            form.appendChild(wrap);
        });

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'peyek-form-submit';
        submitBtn.textContent = submitLabel;
        form.appendChild(submitBtn);

        container.appendChild(form);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            let valid = true;

            form.querySelectorAll('.peyek-form-error').forEach((el) => (el.textContent = ''));
            form.querySelectorAll('input, textarea, select').forEach((el) => el.classList.remove('peyek-error'));

            fields.forEach((field) => {
                const el = form.querySelector(`[name="${field.name}"]`);
                const val = el?.value?.trim() ?? '';
                let err = '';
                if (field.required && !val) err = `${field.label || field.name} is required.`;
                else if (field.minLength && val.length < field.minLength) err = `Minimum ${field.minLength} characters required.`;
                else if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) err = 'Enter a valid email address.';

                if (err) {
                    valid = false;
                    el.classList.add('peyek-error');
                    el.closest('.peyek-form-field').querySelector('.peyek-form-error').textContent = err;
                }
            });

            if (!valid) return;

            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner"></span> Submitting...`;

            const data = Object.fromEntries(new FormData(form).entries());
            try {
                if (onSubmit) await onSubmit(data);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = submitLabel;
            }
        });

        return {
            getData: () => Object.fromEntries(new FormData(form).entries()),
            reset: () => form.reset(),
        };
    }
}
