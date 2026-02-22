# PWA Integration Guide — CodeIgniter (CI3 & CI4)

**Package**: `@rterizz23/peyek-pwa`

## CodeIgniter 4 Setup

### 1. Copy Service Worker to `public/`

```bash
cp node_modules/@rterizz23/peyek-pwa/src/sw-template.js public/sw.js
```

Customize `PRECACHE_URLS` for your CI4 routes.

### 2. Create `public/manifest.json`

```json
{
  "name": "My CI4 App",
  "short_name": "CI4App",
  "theme_color": "#6366f1",
  "background_color": "#0a0a0f",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 3. Add to Your Base Layout

In `app/Views/layouts/base.php`:

```html
<head>
    <!-- ... other tags ... -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#6366f1">
</head>
```

### 4. Initialize PWA in JavaScript

```html
<script type="module">
    import { PwaManager } from '/node_modules/@rterizz23/peyek-pwa/index.js';
    PwaManager.init({ name: 'My CI4 App', themeColor: '#6366f1', swPath: '/sw.js' });
</script>
```

Or if bundling with Mix / Vite:
```js
import { PwaManager } from '@rterizz23/peyek-pwa';
PwaManager.init({ name: 'My CI4 App', themeColor: '#6366f1' });
```

---

## CodeIgniter 3 Setup

### 1. Place files in `assets/` or your public folder

```
assets/
  sw.js           ← Copy from peyek-pwa/src/sw-template.js
  manifest.json   ← Create manually
  icons/
    icon-192.png
    icon-512.png
```

### 2. Add to `application/views/layouts/header.php`

```html
<link rel="manifest" href="<?= base_url('assets/manifest.json') ?>">
<meta name="theme-color" content="#6366f1">
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('<?= base_url("assets/sw.js") ?>', { scope: '/' });
}
</script>
```

> ⚠️ **Scope Warning**: The service worker scope must match the URL path. If your app is at `/myapp/`, set `scope: '/myapp/'` and update `start_url` in manifest.json to `/myapp/`.

## Offline Page

Create `public/offline.html` (CI4) or `assets/offline.html` (CI3) and reference it in `sw.js`.
