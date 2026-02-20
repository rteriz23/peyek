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
export function createElement(tag, attributes = {}, children = []) {
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
export function generateUniqueId() {
    return 'peyek_' + Math.random().toString(36).substr(2, 9);
}
