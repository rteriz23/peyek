<div align="center">

# P.E.Y.E.K 2.0.0 🚀

### Platform Extensible Yielding Engineering Kit

**Build Faster. Shield Better. Deploy Everywhere.**

[![npm version](https://img.shields.io/npm/v/@rterizz23/peyek-core?color=6366f1&logo=npm&style=flat-square)](https://www.npmjs.com/~rterizz23)
[![Downloads](https://img.shields.io/npm/dm/@rterizz23/peyek-core?color=ec4899&style=flat-square)](https://www.npmjs.com/~rterizz23)
[![License](https://img.shields.io/github/license/rteriz23/peyek?color=10b981&style=flat-square)](./LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/rteriz23/peyek?color=f59e0b&style=flat-square)](https://github.com/rteriz23/peyek)

*9 zero-dependency packages · PWA-ready · OWASP Security Hardened · Works with Laravel, Yii, Yii2, CodeIgniter & Android*

[🌐 Website](https://peyek.pcode.my.id) · [📖 Docs](./peyek-website/docs.html) · [💬 WhatsApp](https://wa.me/6281328306288)

</div>

---

## ✨ What is P.E.Y.E.K?

**P.E.Y.E.K** *(Platform Extensible Yielding Engineering Kit)* is an open-source JavaScript platform designed to supercharge PHP and Node.js web projects. Version 2.0.0 introduces a comprehensive security overhaul, new UI components, and improved PWA capabilities.

---

## 📦 Package Ecosystem (9 Packages)

| Package | Description | Version |
|---------|-------------|---------|
| `@rterizz23/peyek-core` | Core utilities & auto modal system | 2.0.0 |
| `@rterizz23/peyek-ui-builder` | Drag & drop embeddable page builder | 2.0.0 |
| `@rterizz23/peyek-pdf-viewer` | Isolated PDF renderer via Web Worker | 2.0.0 |
| `@rterizz23/peyek-pwa` | **Instant PWA**: service worker + manifest + install prompt | 2.0.0 |
| `@rterizz23/peyek-charts` | Zero-dependency Canvas line, bar & donut charts | 2.0.0 |
| `@rterizz23/peyek-table` | Sortable, searchable, paginated data table | 2.0.0 |
| `@rterizz23/peyek-form` | Schema-driven form builder + validation | 2.0.0 |
| `@rterizz23/peyek-toast` | Animated zero-dependency toast notifications | 2.0.0 |
| `@rterizz23/peyek-theme` | Dark/light theme manager with localStorage | 2.0.0 |

---

## 🛡️ Security & Hardening (v2.0.0)

Version 2.0.0 focuses on **OWASP Top 10** compliance across both frontend and backend.

### Backend Hardening (Node.js/Express)
- **Helmet.js Integration**: Sets 15+ security headers (CSP, HSTS, X-Frame, etc.).
- **Rate Limiting**: Global (100 req/min) and Analytics-specific (30 req/min) protection.
- **Input Sanitization**: Built-in XSS and SQL Injection filters for all incoming requests.
- **Body Size Guard**: Limits request payloads to 8KB to prevent DoS attacks.
- **Security Logger**: Logs suspicious activities like path traversal or injection attempts.

### Frontend Protection
- **Content Shield**: Disables right-click, text selection, and DevTools shortcuts on specific sections.
- **Canvas Rendering**: Renders sensitive images (like creator photos) to a watermarked canvas to prevent easy saving/scraping.
- **CSP Nonce Support**: Modern Content Security Policy using nonces for script verification.
- **Print Screen Block**: CSS-based protection that blacks out the page when printing or screen-capturing via browser.

---

## 🚀 Quick Start

```bash
# Scaffold a new project v2.0.0
npx create-peyek-app my-app

# Or install individual packages
npm install @rterizz23/peyek-pwa @rterizz23/peyek-toast @rterizz23/peyek-table
```

---

## 🔌 Framework Integrations

### Android (TWA & WebView)
P.E.Y.E.K 2.0.0 provides a dual-approach for Android:
- **Trusted Web Activity (TWA)**: Recommended for publishing to Play Store with zero native code.
- **Native WebView**: For loading your web app inside an Existing Android app with full bridge support.

📄 [Full Android Integration Guide](./peyek-platform/packages/pwa/integrations/android.md)

---

## 📡 SaaS Backend API

The `peyek-saas-backend` is now hardened and ready for production deployment.

### API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analytics/track` | Track a page visit (IPs are hashed) |
| `GET`  | `/api/analytics/stats` | Get aggregate visitor stats (live) |
| `GET`  | `/api/packages/downloads` | npm download counts for the ecosystem |
| `GET`  | `/api/pwa/manifest` | Generate dynamic manifest.json |

---

## 🗂 Project Structure

```
peyek/
├── peyek-platform/          # Core JavaScript packages (monorepo)
├── peyek-saas-backend/      # Hardened Express.js API server (v2.0.0)
├── peyek-website/           # Marketing website (PWA + Protected)
└── create-peyek-app/        # CLI scaffolder (npx create-peyek-app)
```

---

## 🤝 Contributing

We welcome contributions! Please follow the `git flow` pattern for feature branches.

---

## 📄 License

**MIT License** — Free for personal and commercial use.

---

<div align="center">

Made with ❤️ by **rteriz23** (RULY RIZKI PERDANA S.KOM)

© 2026 Peyek OSS | [GitHub](https://github.com/rteriz23/peyek) · [npm](https://www.npmjs.com/~rterizz23) · [WhatsApp](https://wa.me/6281328306288)

</div>
