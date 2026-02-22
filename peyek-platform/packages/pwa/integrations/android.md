# PWA Integration Guide — Android (TWA & WebView)

**Package**: `@rterizz23/peyek-pwa`

## Option A: Trusted Web Activity (TWA) — Recommended

TWA wraps your existing PWA website into a native Android app published on the Play Store, with **zero extra code** on the Android side.

### Prerequisites

- Your website must score **PWA-ready** (manifest.json + service worker working)
- Chrome 72+ supports TWA
- Requires your domain and an HTTPS-served site

### 1. Install Bubblewrap CLI

```bash
npm install -g @bubblewrap/cli
bubblewrap --version
```

### 2. Initialize TWA Project

```bash
mkdir my-twa && cd my-twa
bubblewrap init --manifest https://yourdomain.com/manifest.json
```

Bubblewrap will prompt you for:
- Package name (e.g., `com.yourname.myapp`)
- App name
- Signing key (you can generate one)

### 3. Build the APK / AAB

```bash
bubblewrap build
```

Output:
- `app-release-signed.apk` — side-loadable APK
- `app-release-bundle.aab` — Google Play upload format

### 4. Digital Asset Links (Required for TWA)

To link your Android app with your domain, add this file:
`https://yourdomain.com/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yourname.myapp",
    "sha256_cert_fingerprints": ["AA:BB:CC:..."]
  }
}]
```

Get your fingerprint with:
```bash
keytool -list -v -keystore my-keystore.jks
```

---

## Option B: Android WebView (Manual)

For loading your P.E.Y.E.K-powered web app inside a native Android WebView:

### `MainActivity.java`

```java
import android.webkit.*;

WebView webView = findViewById(R.id.webview);
WebSettings settings = webView.getSettings();
settings.setJavaScriptEnabled(true);
settings.setDomStorageEnabled(true);       // Required for localStorage (PeyekTheme)
settings.setDatabaseEnabled(true);        // Required for offline data
settings.setCacheMode(WebSettings.LOAD_DEFAULT);

// Allow service worker scope
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
    ServiceWorkerController swController = ServiceWorkerController.getInstance();
    swController.setServiceWorkerClient(new ServiceWorkerClient() {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
            return null; // Let SW handle it
        }
    });
}

webView.loadUrl("https://yourdomain.com");
```

### `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<application
    android:usesCleartextTraffic="false"
    ...>
```

### Notes for WebView PWA

- Service workers only work with **HTTPS** URLs in WebView
- Use `setDomStorageEnabled(true)` so `PeyekTheme` and `PeyekForm` persistent state works
- For local development, use `http://10.0.2.2:PORT` (Android emulator localhost alias)

---

## Verify PWA Score

Before building the Android app, verify your PWA:

```bash
npx lighthouse https://yourdomain.com --output=html --output-path=report.html
open report.html
```

Aim for PWA score ≥ 90 before packaging as TWA.
