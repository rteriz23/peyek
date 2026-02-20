(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PeyekPDFViewer = {}));
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
     * PDF Worker Setup for P.E.Y.E.K
     */

    const PDFJS_VERSION = '3.4.120'; // Compatible stable version

    function setupWorker() {
        return new Promise((resolve, reject) => {
            if (window.pdfjsLib) {
                resolve();
                return;
            }

            // Load pdf.js library dynamically if not present
            const script = document.createElement('script');
            script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
            script.onload = () => {
                // Setup the worker src from CDN after main library loads
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
                }
                resolve();
            };
            script.onerror = (e) => reject(new Error('Failed to load pdf.js from CDN'));
            document.head.appendChild(script);
        });
    }

    const VIEWER_CSS = `
  .peyek-pdf-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    background: #e9e9e9;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .peyek-pdf-page {
    margin-bottom: 20px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    background: #fff;
  }
  .peyek-pdf-toolbar {
    width: 100%;
    padding: 10px;
    background: #333;
    color: white;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .peyek-pdf-toolbar button {
    background: #555;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  .peyek-pdf-toolbar button:hover {
    background: #777;
  }
`;

    /**
     * P.E.Y.E.K PDF Viewer
     * Requires pdf.js to be available globally (`window.pdfjsLib`) or it will attempt to load it from CDN.
     */
    class PDFViewer {
        constructor(containerId, options = {}) {
            this.container = document.getElementById(containerId);
            if (!this.container) throw new Error(`Container #${containerId} not found`);

            this.url = options.url || null;
            this.scale = options.scale || 1.5;
            this.pdfDoc = null;
            this.pageNum = 1;
            this.pageRendering = false;
            this.pageNumPending = null;

            this.initStyles();
            this.initHTML();
        }

        initStyles() {
            if (!document.getElementById('peyek-pdf-styles')) {
                const style = document.createElement('style');
                style.id = 'peyek-pdf-styles';
                style.textContent = VIEWER_CSS;
                document.head.appendChild(style);
            }
        }

        initHTML() {
            this.container.innerHTML = '';

            const wrapper = createElement('div', { className: 'peyek-pdf-container' });

            // Toolbar
            const toolbar = createElement('div', { className: 'peyek-pdf-toolbar' }, [
                createElement('div', {}, [
                    createElement('button', {
                        id: 'peyek-pdf-prev',
                        onClick: () => this.onPrevPage()
                    }, ['Previous'])
                ]),
                createElement('div', {}, [
                    createElement('span', { id: 'peyek-pdf-page-num' }, ['1']),
                    ' / ',
                    createElement('span', { id: 'peyek-pdf-page-count' }, ['?'])
                ]),
                createElement('div', {}, [
                    createElement('button', {
                        id: 'peyek-pdf-next',
                        onClick: () => this.onNextPage()
                    }, ['Next'])
                ])
            ]);

            // Canvas
            const canvas = createElement('canvas', {
                id: 'peyek-pdf-canvas',
                className: 'peyek-pdf-page'
            });

            wrapper.appendChild(toolbar);
            wrapper.appendChild(canvas);
            this.container.appendChild(wrapper);

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
        }

        async load(url) {
            this.url = url || this.url;
            if (!this.url) return;

            await setupWorker();

            try {
                this.pdfDoc = await window.pdfjsLib.getDocument(this.url).promise;
                document.getElementById('peyek-pdf-page-count').textContent = this.pdfDoc.numPages;
                this.renderPage(this.pageNum);
            } catch (error) {
                console.error('[P.E.Y.E.K] Error loading PDF:', error);
                this.container.innerHTML = '<div style="color:red; padding: 20px;">Failed to load PDF. Check console for details.</div>';
            }
        }

        async renderPage(num) {
            this.pageRendering = true;

            try {
                const page = await this.pdfDoc.getPage(num);
                const viewport = page.getViewport({ scale: this.scale });

                this.canvas.height = viewport.height;
                this.canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: this.ctx,
                    viewport: viewport
                };

                await page.render(renderContext).promise;
                this.pageRendering = false;

                if (this.pageNumPending !== null) {
                    this.renderPage(this.pageNumPending);
                    this.pageNumPending = null;
                }
            } catch (e) {
                console.error(e);
            }

            document.getElementById('peyek-pdf-page-num').textContent = num;
        }

        queueRenderPage(num) {
            if (this.pageRendering) {
                this.pageNumPending = num;
            } else {
                this.renderPage(num);
            }
        }

        onPrevPage() {
            if (this.pageNum <= 1) return;
            this.pageNum--;
            this.queueRenderPage(this.pageNum);
        }

        onNextPage() {
            if (this.pageNum >= this.pdfDoc.numPages) return;
            this.pageNum++;
            this.queueRenderPage(this.pageNum);
        }
    }

    exports.PDFViewer = PDFViewer;
    exports.setupWorker = setupWorker;

}));
//# sourceMappingURL=peyek.pdf-viewer.js.map
