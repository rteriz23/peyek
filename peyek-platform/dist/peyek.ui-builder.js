(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PeyekUIBuilder = {}));
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
     * P.E.Y.E.K UI Builder - Default Components
     */
    const Components = {
        text: {
            name: 'Text Block',
            icon: 'T',
            render: () => {
                return createElement('div', {
                    className: 'peyek-component peyek-comp-text',
                    contentEditable: 'true',
                    style: {
                        padding: '10px',
                        fontFamily: 'sans-serif',
                        minHeight: '20px',
                        border: '1px dashed transparent',
                        outline: 'none'
                    }
                }, ['Double click to edit text']);
            }
        },

        heading: {
            name: 'Heading',
            icon: 'H',
            render: () => {
                return createElement('h2', {
                    className: 'peyek-component peyek-comp-heading',
                    contentEditable: 'true',
                    style: {
                        padding: '10px',
                        fontFamily: 'sans-serif',
                        margin: '0',
                        outline: 'none'
                    }
                }, ['Heading Text']);
            }
        },

        button: {
            name: 'Button',
            icon: 'B',
            render: () => {
                return createElement('button', {
                    className: 'peyek-component peyek-comp-button',
                    contentEditable: 'true',
                    style: {
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'sans-serif'
                    }
                }, ['Button']);
            }
        }
    };

    /**
     * Drag and Drop Manager for P.E.Y.E.K Builder
     */
    class DragDropManager {
        constructor(builder) {
            this.builder = builder;
            this.draggedType = null;
        }

        initDraggable(element, type) {
            element.setAttribute('draggable', 'true');
            element.addEventListener('dragstart', (e) => this.handleDragStart(e, type));
            element.addEventListener('dragend', (e) => this.handleDragEnd(e));
        }

        initDropzone(element) {
            element.addEventListener('dragover', (e) => this.handleDragOver(e));
            element.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            element.addEventListener('drop', (e) => this.handleDrop(e));
        }

        handleDragStart(e, type) {
            this.draggedType = type;
            e.dataTransfer.effectAllowed = 'copy';
            e.target.style.opacity = '0.5';
        }

        handleDragEnd(e) {
            e.target.style.opacity = '1';
            this.draggedType = null;
        }

        handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            if (e.target.classList.contains('peyek-dropzone') || e.target.closest('.peyek-dropzone')) {
                const dropzone = e.target.classList.contains('peyek-dropzone') ? e.target : e.target.closest('.peyek-dropzone');
                dropzone.classList.add('peyek-drag-over');
            }
        }

        handleDragLeave(e) {
            if (e.target.classList.contains('peyek-dropzone')) {
                e.target.classList.remove('peyek-drag-over');
            }
        }

        handleDrop(e) {
            e.preventDefault();

            let dropzone = e.target;
            if (!dropzone.classList.contains('peyek-dropzone')) {
                dropzone = dropzone.closest('.peyek-dropzone');
            }

            if (dropzone) {
                dropzone.classList.remove('peyek-drag-over');
                if (this.draggedType) {
                    this.builder.addComponent(this.draggedType, dropzone);
                }
            }
        }
    }

    const BUILDER_CSS = `
  .peyek-builder-container {
    display: flex;
    height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
    border: 1px solid #ddd;
    background: #f9f9f9;
  }
  .peyek-sidebar {
    width: 250px;
    background: #fff;
    border-right: 1px solid #eee;
    padding: 20px;
    overflow-y: auto;
  }
  .peyek-canvas {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
  .peyek-dropzone {
    background: #fff;
    min-height: 400px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;
  }
  .peyek-dropzone.peyek-drag-over {
    border-color: #007bff;
    background: #f0f7ff;
  }
  .peyek-sidebar-item {
    background: #f8f9fa;
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
    cursor: grab;
    display: flex;
    align-items: center;
    user-select: none;
  }
  .peyek-sidebar-item:active {
    cursor: grabbing;
  }
  .peyek-sidebar-icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    background: #eee;
    text-align: center;
    line-height: 24px;
    border-radius: 4px;
    margin-right: 10px;
    font-weight: bold;
    color: #555;
  }
  .peyek-component {
    position: relative;
    margin-bottom: 10px;
  }
  .peyek-component:hover {
    outline: 2px solid #007bff !important;
  }
`;

    class UIBuilder {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) throw new Error(`Container #${containerId} not found`);

            this.ddManager = new DragDropManager(this);
            this.initStyles();
        }

        initStyles() {
            if (!document.getElementById('peyek-builder-styles')) {
                const style = document.createElement('style');
                style.id = 'peyek-builder-styles';
                style.textContent = BUILDER_CSS;
                document.head.appendChild(style);
            }
        }

        render() {
            this.container.innerHTML = '';

            const wrapper = createElement('div', { className: 'peyek-builder-container' });

            // Sidebar
            const sidebar = createElement('div', { className: 'peyek-sidebar' }, [
                createElement('h3', { style: { marginTop: '0', color: '#333' } }, ['Components'])
            ]);

            Object.keys(Components).forEach(key => {
                const comp = Components[key];
                const item = createElement('div', { className: 'peyek-sidebar-item' }, [
                    createElement('span', { className: 'peyek-sidebar-icon' }, [comp.icon]),
                    comp.name
                ]);
                this.ddManager.initDraggable(item, key);
                sidebar.appendChild(item);
            });

            // Canvas / Dropzone
            const canvas = createElement('div', { className: 'peyek-canvas' });
            const dropzone = createElement('div', { className: 'peyek-dropzone' }, [
                createElement('div', { style: { color: '#999', textAlign: 'center', marginTop: '40px' } }, ['Drag components here'])
            ]);

            this.ddManager.initDropzone(dropzone);
            canvas.appendChild(dropzone);

            wrapper.appendChild(sidebar);
            wrapper.appendChild(canvas);
            this.container.appendChild(wrapper);
        }

        addComponent(type, targetDropzone) {
            if (Components[type]) {
                // Remove placeholder text if it's the first element
                const placeholder = targetDropzone.querySelector('div[style*="text-align: center"]');
                if (placeholder) {
                    placeholder.remove();
                }

                const el = Components[type].render();
                targetDropzone.appendChild(el);

                // We could add edit/delete overlays here in a real full implementation
            }
        }
    }

    exports.Components = Components;
    exports.DragDropManager = DragDropManager;
    exports.UIBuilder = UIBuilder;

}));
//# sourceMappingURL=peyek.ui-builder.js.map
