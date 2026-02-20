/**
 * PDF Worker Setup for P.E.Y.E.K
 */

const PDFJS_VERSION = '3.4.120'; // Compatible stable version

export function setupWorker() {
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
