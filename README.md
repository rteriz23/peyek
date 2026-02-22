<div align="center">

# P.E.Y.E.K

### Platform Extensible Yielding Engineering Kit

**Build Faster. Drag Smarter. Deploy Anywhere.**

[![npm version](https://img.shields.io/npm/v/@rterizz23/peyek-core?color=6366f1&logo=npm&style=flat-square)](https://www.npmjs.com/~rterizz23)
[![Downloads](https://img.shields.io/npm/dm/@rterizz23/peyek-core?color=ec4899&style=flat-square)](https://www.npmjs.com/~rterizz23)
[![License](https://img.shields.io/github/license/rteriz23/peyek?color=10b981&style=flat-square)](./LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/rteriz23/peyek?color=f59e0b&style=flat-square)](https://github.com/rteriz23/peyek)

*9 zero-dependency packages · PWA-ready · Works with Laravel, Yii, Yii2, CodeIgniter & Android*

[🌐 Website](https://github.com/rteriz23/peyek) · [📖 Docs](./peyek-website/docs.html) · [💬 WhatsApp](https://wa.me/6281328306288)

</div>

---

## ✨ What is P.E.Y.E.K?

**P.E.Y.E.K** *(Platform Extensible Yielding Engineering Kit)* is an open-source JavaScript platform designed to supercharge PHP and Node.js web projects. Drop any package into an existing Laravel, Yii, Yii2, CodeIgniter, or Android project without a framework lock-in.

---

## 📦 Package Ecosystem (9 Packages)

| Package | Description | Install |
|---------|-------------|---------|
| `@rterizz23/peyek-core` | Core utilities & auto modal system | `npm i @rterizz23/peyek-core` |
| `@rterizz23/peyek-ui-builder` | Drag & drop embeddable page builder | `npm i @rterizz23/peyek-ui-builder` |
| `@rterizz23/peyek-pdf-viewer` | Isolated PDF renderer via Web Worker | `npm i @rterizz23/peyek-pdf-viewer` |
| `@rterizz23/peyek-pwa` | **Instant PWA**: service worker + manifest + install prompt | `npm i @rterizz23/peyek-pwa` |
| `@rterizz23/peyek-charts` | Zero-dependency Canvas line, bar & donut charts | `npm i @rterizz23/peyek-charts` |
| `@rterizz23/peyek-table` | Sortable, searchable, paginated data table | `npm i @rterizz23/peyek-table` |
| `@rterizz23/peyek-form` | Schema-driven form builder + validation | `npm i @rterizz23/peyek-form` |
| `@rterizz23/peyek-toast` | Animated zero-dependency toast notifications | `npm i @rterizz23/peyek-toast` |
| `@rterizz23/peyek-theme` | Dark/light theme manager with localStorage | `npm i @rterizz23/peyek-theme` |

---

## 🚀 Quick Start

```bash
# Scaffold a new project
npx create-peyek-app my-app

# Or install individual packages
npm install @rterizz23/peyek-pwa @rterizz23/peyek-toast @rterizz23/peyek-table
```

---

## 🔑 Usage Examples

### Instant PWA
```js
import { PwaManager } from '@rterizz23/peyek-pwa';

PwaManager.init({
    name: 'My App',
    themeColor: '#6366f1',
    swPath: '/sw.js',
});

// Listen for browser install prompt
window.addEventListener('peyek:pwa:installable', () => {
    document.getElementById('install-btn').style.display = 'block';
});
```

### Toast Notifications
```js
import { PeyekToast } from '@rterizz23/peyek-toast';

PeyekToast.success('Data saved successfully! ✅');
PeyekToast.error('Something went wrong. Please try again.', 5000);
PeyekToast.warning('Your session expires in 5 minutes.');
```

### Data Table
```js
import { PeyekTable } from '@rterizz23/peyek-table';

new PeyekTable('#container', {
    columns: [
        { key: 'name',  label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'role',  label: 'Role' },
    ],
    data: [...yourData],
    pageSize: 10,
});
```

### Charts
```js
import { PeyekCharts } from '@rterizz23/peyek-charts';

PeyekCharts.line('#myCanvas', {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    data: [120, 190, 150, 280],
    title: 'Monthly Sales',
});
```

### Form Builder
```js
import { PeyekForm } from '@rterizz23/peyek-form';

PeyekForm.build({
    target: '#form-container',
    fields: [
        { name: 'email',   type: 'email',    label: 'Email',   required: true },
        { name: 'message', type: 'textarea', label: 'Message', minLength: 10 },
    ],
    onSubmit: async (data) => {
        await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
        PeyekToast.success('Message sent!');
    },
    submitLabel: 'Send Message',
});
```

### Theme Manager
```js
import { PeyekTheme } from '@rterizz23/peyek-theme';

PeyekTheme.init(); // Auto-detect system preference
document.getElementById('theme-toggle').addEventListener('click', () => PeyekTheme.toggle());
```

---

## 🔌 Framework Integrations

### Laravel
```blade
{{-- resources/views/layouts/app.blade.php --}}
<link rel="manifest" href="{{ asset('manifest.json') }}">
<meta name="theme-color" content="#6366f1">
```
```bash
cp node_modules/@rterizz23/peyek-pwa/src/sw-template.js public/sw.js
```
📄 [Full Laravel Guide](./peyek-platform/packages/pwa/integrations/laravel.md)

---

### Yii2
```php
// common/assets/PwaAsset.php
\Yii::$app->view->registerLinkTag(['rel' => 'manifest', 'href' => '/manifest.json']);
```
📄 [Full Yii2 Guide](./peyek-platform/packages/pwa/integrations/yii2.md)

---

### Yii 1.x
```php
Yii::app()->clientScript->registerScript('pwa', "
    navigator.serviceWorker.register('/sw.js');
", CClientScript::POS_END);
```
📄 [Full Yii Guide](./peyek-platform/packages/pwa/integrations/yii.md)

---

### CodeIgniter (CI3 & CI4)
```bash
cp node_modules/@rterizz23/peyek-pwa/src/sw-template.js public/sw.js
```
📄 [Full CodeIgniter Guide](./peyek-platform/packages/pwa/integrations/codeigniter.md)

---

### Android (TWA)
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://yourdomain.com/manifest.json
bubblewrap build
```
📄 [Full Android Guide](./peyek-platform/packages/pwa/integrations/android.md)

---

## 📡 SaaS Backend API

The `peyek-saas-backend` is an Express.js server providing analytics, license management, and PWA manifest generation.

### Start the backend
```bash
cd peyek-saas-backend
npm start
# Listens on http://localhost:3000
```

### API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Health check + uptime |
| `POST` | `/api/license/generate` | Generate a license key |
| `POST` | `/api/license/verify` | Verify a license key |
| `POST` | `/api/analytics/track` | Track a page visit |
| `GET`  | `/api/analytics/stats` | Get aggregate visitor stats |
| `GET`  | `/api/packages/downloads` | npm download counts (all packages) |
| `GET`  | `/api/pwa/manifest` | Generate dynamic manifest.json |

### Track Visitor Example
```js
// From your website's script.js
fetch('https://your-backend.com/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        page: window.location.pathname,
        referrer: document.referrer,
    }),
});
```

### Get Stats Example
```bash
curl http://localhost:3000/api/analytics/stats
# Returns: { totalVisits, uniqueVisitors, last24h, topPages, topReferrers }
```

### npm Download Monitoring
```bash
curl http://localhost:3000/api/packages/downloads
# Returns: { totalDownloads, packages: [{ package, downloads }] }
```

> 💡 **Tip:** Point the website's `script.js` `BACKEND` variable to your deployed SaaS backend URL to see live visitor counts and npm download stats on your website.

---

## 📊 Monitoring Your Stats

P.E.Y.E.K includes two complementary monitoring approaches:

### 1. npm Download Badges (Instant, No Server Needed)
Use [shields.io](https://shields.io) badges in your README or website:

```md
![Downloads](https://img.shields.io/npm/dm/@rterizz23/peyek-core?style=flat-square)
```

### 2. Self-Hosted Analytics (Privacy-First)
Run `peyek-saas-backend` and point your website to it:
- **No third-party trackers** — all data stays on your server
- **No PII stored** — IPs are hashed (SHA-256, first 12 chars only)
- **Live stats API** — integrate into your own dashboard
- Returns: total visits, unique visitors, top pages, top referrers

---

## 🗂 Project Structure

```
peyek/
├── peyek-platform/          # Core JavaScript packages (monorepo)
│   ├── packages/
│   │   ├── core/            # @rterizz23/peyek-core
│   │   ├── ui-builder/      # @rterizz23/peyek-ui-builder
│   │   ├── pdf-viewer/      # @rterizz23/peyek-pdf-viewer
│   │   ├── pwa/             # @rterizz23/peyek-pwa ✨ NEW
│   │   │   └── integrations/
│   │   │       ├── laravel.md
│   │   │       ├── yii.md
│   │   │       ├── yii2.md
│   │   │       ├── codeigniter.md
│   │   │       └── android.md
│   │   ├── charts/          # @rterizz23/peyek-charts ✨ NEW
│   │   ├── table/           # @rterizz23/peyek-table ✨ NEW
│   │   ├── form/            # @rterizz23/peyek-form ✨ NEW
│   │   ├── toast/           # @rterizz23/peyek-toast ✨ NEW
│   │   └── theme/           # @rterizz23/peyek-theme ✨ NEW
│   ├── rollup.config.js
│   └── package.json
│
├── peyek-saas-backend/      # Express.js API server (v1.5.0)
│   ├── controllers/
│   │   ├── LicenseController.js
│   │   ├── AnalyticsController.js  ✨ NEW
│   │   ├── PackagesController.js   ✨ NEW
│   │   └── PwaController.js        ✨ NEW
│   ├── routes/
│   │   ├── analytics.js            ✨ NEW
│   │   ├── packages.js             ✨ NEW
│   │   └── pwa.js                  ✨ NEW
│   └── server.js
│
├── peyek-website/           # Marketing website (PWA-enabled)
│   ├── index.html           # ✨ Full redesign
│   ├── style.css            # ✨ Premium glassmorphism CSS
│   ├── script.js            # ✨ Counters + analytics ping
│   ├── docs.html
│   ├── manifest.json        # ✨ NEW — Website PWA manifest
│   └── sw.js                # ✨ NEW — Service Worker
│
├── create-peyek-app/        # CLI scaffolder (npx create-peyek-app)
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a Pull Request

---

## 📄 License

**MIT License** — Free for personal and commercial use.

---

<div align="center">

Made with ❤️ by **rteriz23** (RULY RIZKI PERDANA S.KOM)

© 2026 Peyek OSS | [GitHub](https://github.com/rteriz23/peyek) · [npm](https://www.npmjs.com/~rterizz23) · [WhatsApp](https://wa.me/6281328306288)

</div>
