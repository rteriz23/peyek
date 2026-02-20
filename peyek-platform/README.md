# P.E.Y.E.K
**Platform Extensible Yielding Engineering Kit**

*“Build Faster. Drag Smarter. Deploy Anywhere.”*

P.E.Y.E.K is a powerful, lightweight, framework-agnostic JavaScript SDK designed to seamlessly integrate with PHP Frameworks (Yii1, Yii2, Laravel, CodeIgniter, etc.) and other backend systems.

## Features
- **Auto Modal**: Dynamically generated, stylized modals without bulky dependencies like Bootstrap.
- **API Wrapper**: Built-in `fetch` wrapper that auto-detects Laravel/Yii CSRF tokens from meta tags.
- **UI Drag & Drop Builder**: A built-in layout assembler.
- **PDF Previewer**: An easy-to-use wrapper around `pdf.js` to render PDFs directly in the browser safely.

## Installation

### Via NPM
```bash
npm install @rterizz23/peyek-core @rterizz23/peyek-ui-builder @rterizz23/peyek-pdf-viewer
```

### Via Browser / CDN
(Coming soon: Unpkg / JSDelivr links for `dist/peyek.bundle.min.js`)

## Usage Examples

### 1. Auto Modal
```javascript
import Peyek from '@rterizz23/peyek-core';

// Initialize core to detect CSRF tokens automatically
Peyek.init();

// Show a modal
Peyek.Modal.show({
  title: 'Hello P.E.Y.E.K',
  content: 'This modal is auto-generated!'
});
```

### 2. UI Builder
Provides a built-in drag-and-drop builder interface. Needs a designated container.
```html
<div id="builder-app"></div>
```
```javascript
import { UIBuilder } from '@rterizz23/peyek-ui-builder';

const builder = new UIBuilder('builder-app');
builder.render();
```

### 3. PDF Previewer
View a PDF document seamlessly.
```html
<div id="pdf-app" style="height: 600px;"></div>
```
```javascript
import { PDFViewer } from '@rterizz23/peyek-pdf-viewer';

const viewer = new PDFViewer('pdf-app');
viewer.load('/path/to/document.pdf');
```

## Architecture
This project is structured as an npm monorepo (workspaces).
- `packages/core`: Core logic and modals.
- `packages/ui-builder`: The UI drag-and-drop interface.
- `packages/pdf-viewer`: PDF rendering abstraction.

### Build Instructions
To build the standalone bundle:
```bash
npm install
npm run build
```
The output will be available in the `dist` directory.
