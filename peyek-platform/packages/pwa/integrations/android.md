# P.E.Y.E.K v2.0.0 — Android Integration Guide (TWA & WebView)

Integrate your P.E.Y.E.K web apps into native Android environments with full security support.

## Option A: Trusted Web Activity (TWA) — Recommended

TWA is the fastest way to publish to the Play Store. It uses a high-performance Chrome custom tab to wrap your PWA.

### 1. Build Requirements
- Your PWA must have a valid `manifest.json` and a Service Worker (already in P.E.Y.E.K 2.0.0).
- Score 100/100 on PWA Lighthouse.

### 2. Simple Deployment (Bubblewrap)
```bash
npx @bubblewrap/cli init --manifest https://peyek.pcode.my.id/manifest.json
npx @bubblewrap/cli build
```

### 3. Native Security Verification
Ensure `assetlinks.json` is present at `.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.rterizz23.peyek",
    "sha256_cert_fingerprints": ["YOUR_SHA256_HERE"]
  }
}]
```

---

## Option B: Native Android WebView (Full Control)

Ideal for integrating P.E.Y.E.K components into existing Android UI.

### 1. Security-Hardened WebView Config

```java
// MainActivity.java
WebView webView = findViewById(R.id.webview);
WebSettings s = webView.getSettings();

s.setJavaScriptEnabled(true);
s.setDomStorageEnabled(true); // Mandatory for PeyekTheme & LocalStorage
s.setDatabaseEnabled(true);
s.setAllowFileAccess(false); // Security: disable file access
s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW); // Security: Force HTTPS
```

### 2. Handling Content Protection
P.E.Y.E.K 2.0.0 uses Canvas and Nonces. In WebView, ensure:
- **Media Playback**: Set `s.setMediaPlaybackRequiresUserGesture(false);` if using auto-playing alerts.
- **Hardware Acceleration**: Must be **ON** for `@rterizz23/peyek-charts` and `protect.js` canvas rendering to work smoothly.

### 3. Bridge Strategy (Optional)
If you need to call native Android toasts from P.E.Y.E.K:
```java
webView.addJavascriptInterface(new Object() {
    @JavascriptInterface
    public void showToast(String msg) {
        Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show();
    }
}, "AndroidBridge");
```
Then in JS:
```js
if (window.AndroidBridge) window.AndroidBridge.showToast("Hello from PEYEK!");
```

---

## 🛡️ Security Best Practices for Android
1. **Always use HTTPS**: Service Workers and PWA features will fail on HTTP in WebView.
2. **Handle Nonces**: If your backend emits a dynamic CSP nonce, ensure your WebView client injects it if you modify the HTML dynamically.
3. **CSP**: Ensure your Android network security config (`res/xml/network_security_config.xml`) allows cleartext traffic **only** for localhost if debugging.

---

Made with ❤️ for the Android Community by **rteriz23**.
