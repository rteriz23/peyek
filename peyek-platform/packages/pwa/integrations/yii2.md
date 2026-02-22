# PWA Integration Guide — Yii2 Framework

**Package**: `@rterizz23/peyek-pwa`

## Installation

```bash
npm install @rterizz23/peyek-pwa
```

## Step-by-Step Setup

### 1. Copy Service Worker

```bash
cp node_modules/@rterizz23/peyek-pwa/src/sw-template.js web/sw.js
```

### 2. Create `web/manifest.json`

```json
{
  "name": "My Yii2 App",
  "short_name": "Yii2App",
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

### 3. Create a PWA Asset Bundle

Create `common/assets/PwaAsset.php`:

```php
<?php
namespace common\assets;

use yii\web\AssetBundle;
use yii\web\View;

class PwaAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl  = '@web';
    public $js       = ['js/pwa-init.js'];

    public function init()
    {
        parent::init();
        \Yii::$app->view->registerLinkTag([
            'rel'  => 'manifest',
            'href' => \yii\helpers\Html::encode(\Yii::$app->urlManager->createUrl(['/manifest.json'])),
        ]);
        \Yii::$app->view->registerMetaTag(['name' => 'theme-color', 'content' => '#6366f1']);
    }
}
```

### 4. Create `web/js/pwa-init.js`

```js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(reg => console.log('[PWA Yii2] Registered:', reg.scope))
            .catch(err => console.error('[PWA Yii2] Error:', err));
    });
}

// Optional: Detect install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._peyekInstallPrompt = e;
    document.getElementById('pwa-install-btn')?.removeAttribute('hidden');
});

document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
    if (!window._peyekInstallPrompt) return;
    window._peyekInstallPrompt.prompt();
    const { outcome } = await window._peyekInstallPrompt.userChoice;
    if (outcome === 'accepted') document.getElementById('pwa-install-btn')?.setAttribute('hidden', '');
    window._peyekInstallPrompt = null;
});
```

### 5. Register in Layout

In `backend/views/layouts/main.php` or `frontend/views/layouts/main.php`:

```php
<?php
\common\assets\PwaAsset::register($this);
?>
```

And add the install button anywhere in the layout:

```php
<button id="pwa-install-btn" hidden class="btn btn-primary">📲 Install App</button>
```

### 6. Verify

1. Run `php yii serve`
2. Open Chrome DevTools → **Application** → **Manifest** and **Service Workers**

## Notes

- In advanced projects, use Yii2's AssetManager with `hash` paths. Make sure SW scope is `/` not a hashed path.
- In Yii2 Basic template: place `manifest.json` and `sw.js` in `web/`
- In Yii2 Advanced template: place in `frontend/web/` and/or `backend/web/` as needed
