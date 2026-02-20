import { Utils } from '@rterizz23/peyek-core';
import { setupWorker } from './pdf.worker.js';

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
export class PDFViewer {
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

        const wrapper = Utils.createElement('div', { className: 'peyek-pdf-container' });

        // Toolbar
        const toolbar = Utils.createElement('div', { className: 'peyek-pdf-toolbar' }, [
            Utils.createElement('div', {}, [
                Utils.createElement('button', {
                    id: 'peyek-pdf-prev',
                    onClick: () => this.onPrevPage()
                }, ['Previous'])
            ]),
            Utils.createElement('div', {}, [
                Utils.createElement('span', { id: 'peyek-pdf-page-num' }, ['1']),
                ' / ',
                Utils.createElement('span', { id: 'peyek-pdf-page-count' }, ['?'])
            ]),
            Utils.createElement('div', {}, [
                Utils.createElement('button', {
                    id: 'peyek-pdf-next',
                    onClick: () => this.onNextPage()
                }, ['Next'])
            ])
        ]);

        // Canvas
        const canvas = Utils.createElement('canvas', {
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
