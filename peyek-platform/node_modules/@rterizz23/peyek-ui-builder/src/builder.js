import { Utils } from '@rterizz23/peyek-core';
import { Components } from './components.js';
import { DragDropManager } from './dragdrop.js';

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

export class UIBuilder {
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

        const wrapper = Utils.createElement('div', { className: 'peyek-builder-container' });

        // Sidebar
        const sidebar = Utils.createElement('div', { className: 'peyek-sidebar' }, [
            Utils.createElement('h3', { style: { marginTop: '0', color: '#333' } }, ['Components'])
        ]);

        Object.keys(Components).forEach(key => {
            const comp = Components[key];
            const item = Utils.createElement('div', { className: 'peyek-sidebar-item' }, [
                Utils.createElement('span', { className: 'peyek-sidebar-icon' }, [comp.icon]),
                comp.name
            ]);
            this.ddManager.initDraggable(item, key);
            sidebar.appendChild(item);
        });

        // Canvas / Dropzone
        const canvas = Utils.createElement('div', { className: 'peyek-canvas' });
        const dropzone = Utils.createElement('div', { className: 'peyek-dropzone' }, [
            Utils.createElement('div', { style: { color: '#999', textAlign: 'center', marginTop: '40px' } }, ['Drag components here'])
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
