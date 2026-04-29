# Offline Demo Zip

The offline demo is a complete side build of the ICCC app. It does not replace the deployed Cloudflare/Gemini flow.

## Build

```bash
npm run package:offline
```

The zip is written to:

```text
offline-build/iccc-demo-offline.zip
```

## Use

1. Extract the zip on the demo laptop.
2. Open the extracted `index.html` in a Chromium-based browser. Do not open the repository's source `index.html`; use the one inside the generated zip.
3. On first use, keep internet available and open AI Copilot once. The Copilot loads Transformers.js and Gemma 3 270M into the browser cache.
4. After that warm-up, the same extracted folder can be opened without network access for demos.

The zip contains only static web files and documentation. It does not contain installers, executables, or a local server. The dashboard, GIS screens, evidence views, FRS flow, alerts, infrastructure pages, and demo assets are shipped inside the zip; the Copilot is the only part that needs a first-run online warm-up for model caching.

## Notes

- The regular app still uses `VITE_WORKER_URL` and the Cloudflare Worker Gemini proxy.
- The offline build sets `VITE_OFFLINE_DEMO=true`, switches routing to hash URLs, uses relative asset paths, removes remote font links, inlines built CSS/JS, and routes Copilot requests to `google/gemma-3-270m-it` through Transformers.js.
- Map tiles use a local schematic grid in offline mode so the GIS screens remain usable without network tile requests.
