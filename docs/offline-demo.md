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
2. Run `start-offline-demo.bat`.
3. Open the localhost URL shown by the terminal if it does not open automatically.

The dashboard, GIS screens, evidence views, FRS flow, alerts, infrastructure pages, demo assets, Google fonts, Material Symbols, Transformers.js, its ONNX/WebAssembly runtime sidecar files, local Esri map tiles, and the LFM2.5 1.2B q4 ONNX model are shipped inside the zip. No Hugging Face token or first-run model download is required.

The AI model must be served from `http://127.0.0.1` because browsers block JavaScript `fetch()` access to model shards from plain `file://` pages. Opening `index.html` directly still loads the shell UI, but AI Copilot will ask you to use `start-offline-demo.bat`.

## Notes

- The regular app still uses `VITE_WORKER_URL` and the Cloudflare Worker Gemini proxy.
- The offline build sets `VITE_OFFLINE_DEMO=true`, switches routing to hash URLs, uses relative asset paths, embeds Google font assets into `index.html`, inlines built CSS/JS as a classic browser script, and routes Copilot requests to `LiquidAI/LFM2.5-1.2B-Instruct-ONNX` through the bundled `vendor/transformers.min.js` runtime.
- Map tiles use the repo's normal Esri imagery source at build time and are stored under `vendor/map-tiles/esri/` for offline use.
- LFM2.5 browser inference requires WebGPU in Chrome or Edge.
- `npm` is only needed where the zip is built. The laptop receiving the zip needs Node.js only to run the tiny local static server in `offline-server.cjs`.
