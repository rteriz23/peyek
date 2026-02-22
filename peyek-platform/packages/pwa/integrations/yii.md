# PWA Integration Guide — Yii Framework (Yii 1.x)

**Package**: `@rterizz23/peyek-pwa`

## Step-by-Step Setup

### 1. Copy Files to `www/` or `web/` (your web root)

```bash
cp node_modules/@rterizz23/peyek-pwa/src/sw-template.js www/sw.js
```

### 2. Create `www/manifest.json`

```json
{
  "name": "My Yii App",
  "short_name": "YiiApp",
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

### 3. Add Meta Tags to Main Layout

In `protected/views/layouts/main.php`:

```php
<head>
    <?php
        $assetsUrl = Yii::app()->assetManager->baseUrl;
    ?>
    <link rel="manifest" href="<?= Yii::app()->baseUrl ?>/manifest.json">
    <meta name="theme-color" content="#6366f1">
    <meta name="apple-mobile-web-app-capable" content="yes">
</head>
```

### 4. Register Service Worker via CClientScript

In `protected/views/layouts/main.php` (at the bottom):

```php
<?php Yii::app()->clientScript->registerScript('pwa-register', "
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('<?= Yii::app()->baseUrl ?>/sw.js', {
            scope: '<?= Yii::app()->baseUrl ?>/'
        }).then(function(reg) {
            console.log('[PWA] Registered:', reg.scope);
        });
    }
", CClientScript::POS_END); ?>
```

### 5. Configure Service Worker Scope

In `www/sw.js`, update the precache list with your Yii routes:

```js
const PRECACHE_URLS = [
    '/',
    '/index.php',
    '/index.php/site/index',
    '/css/main.css',
    '/js/app.js',
    '/offline.html',
];
```

## Icons Setup

Place icons in `www/icons/`:
- `icon-72.png` (72×72)
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

## Notes

- Yii 1.x doesn't use npm natively. You may install P.E.Y.E.K packages with npm at the project root and manually copy the compiled output to your `www/js/` folder.
- Ensure `SW-Token` or CSRF is excluded from the service worker's cached responses.
