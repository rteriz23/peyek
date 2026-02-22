# PWA Integration Guide — Laravel

**Package**: `@rterizz23/peyek-pwa`

## Installation

```bash
npm install @rterizz23/peyek-pwa
```

## Step-by-Step Setup

### 1. Copy the Service Worker to `public/`

```bash
cp node_modules/@rterizz23/peyek-pwa/src/sw-template.js public/sw.js
```

Customize `PRECACHE_URLS` in `public/sw.js` for your Laravel routes.

### 2. Add Manifest & Meta Tags to Your Layout

In `resources/views/layouts/app.blade.php` (inside `<head>`):

```html
<!-- PWA Manifest -->
<link rel="manifest" href="{{ asset('manifest.json') }}">
<meta name="theme-color" content="#6366f1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### 3. Create `public/manifest.json`

```json
{
  "name": "Your Laravel App",
  "short_name": "App",
  "description": "Built with P.E.Y.E.K Platform",
  "theme_color": "#6366f1",
  "background_color": "#0a0a0f",
  "display": "standalone",
  "start_url": "/",
  "scope": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 4. Register the Service Worker in JavaScript

In your `resources/js/app.js`:

```js
import { PwaManager } from '@rterizz23/peyek-pwa';

PwaManager.init({
    name: 'Your Laravel App',
    themeColor: '#6366f1',
    swPath: '/sw.js',
});

// Optional: Show custom install button
window.addEventListener('peyek:pwa:installable', () => {
    document.getElementById('install-btn').style.display = 'block';
});
document.getElementById('install-btn')?.addEventListener('click', () => {
    PwaManager.promptInstall();
});
```

Then add to your HTML:
```html
<button id="install-btn" style="display:none" class="btn btn-primary">
  📲 Install App
</button>
```

### 5. Create Icons

Place your app icons at:
- `public/icons/icon-72.png`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`

> 💡 Use [realfavicongenerator.net](https://realfavicongenerator.net) to generate all icon sizes.

### 6. Verify in Browser

1. Open your Laravel app in Chrome
2. Open DevTools → **Application** tab
3. Check **Manifest** — should show your app name and icons
4. Check **Service Workers** — should show `/sw.js` as registered

### 7. Add Offline Fallback Page

Create `public/offline.html`:

```html
<!DOCTYPE html>
<html>
<head><title>You're Offline</title></head>
<body style="font-family:sans-serif;text-align:center;padding:80px">
  <h1>🔌 No Connection</h1>
  <p>Please check your internet and try again.</p>
  <button onclick="location.reload()">Retry</button>
</body>
</html>
```

## Notes

- Service workers require **HTTPS** in production (or `localhost` for development)
- In **Vite + Laravel**: run `npm run build` after adding the SW to public
- Add `/sw.js` and `/manifest.json` to your `.gitignore` if you auto-generate them
