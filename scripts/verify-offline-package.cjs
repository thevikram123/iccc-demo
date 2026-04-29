const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const indexFile = path.join(repoRoot, 'dist-offline', 'index.html');
const transformersRuntimeFiles = [
  'transformers.min.js',
  'ort-wasm-simd-threaded.asyncify.mjs',
  'ort-wasm-simd-threaded.asyncify.wasm',
  'ort-wasm-simd-threaded.jsep.mjs',
  'ort-wasm-simd-threaded.jsep.wasm',
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.wasm',
];
const gemmaModelFiles = [
  'added_tokens.json',
  'chat_template.jinja',
  'config.json',
  'generation_config.json',
  'special_tokens_map.json',
  'tokenizer.json',
  'tokenizer.model',
  'tokenizer_config.json',
  'onnx/model_fp16.onnx',
  'onnx/model_fp16.onnx_data',
];
const googleFontsCssFile = path.join(repoRoot, 'dist-offline', 'vendor', 'google-fonts', 'fonts.css');
const zipFile = path.join(repoRoot, 'offline-build', 'iccc-demo-offline.zip');

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

const expectedFiles = [
  indexFile,
  googleFontsCssFile,
  zipFile,
  path.join(repoRoot, 'dist-offline', 'offline-server.cjs'),
  path.join(repoRoot, 'dist-offline', 'start-offline-demo.bat'),
  ...transformersRuntimeFiles.map((fileName) => path.join(repoRoot, 'dist-offline', 'vendor', fileName)),
  ...gemmaModelFiles.map((fileName) => path.join(repoRoot, 'dist-offline', 'vendor', 'models', 'onnx-community', 'gemma-3-270m-it-ONNX', fileName)),
];

for (const file of expectedFiles) {
  if (!fs.existsSync(file)) {
    fail(`Missing expected offline artifact: ${path.relative(repoRoot, file)}`);
  }
}

if (process.exitCode) process.exit();

const html = fs.readFileSync(indexFile, 'utf8');
const fontCss = fs.readFileSync(googleFontsCssFile, 'utf8');
const referencedFonts = [...fontCss.matchAll(/url\(vendor\/google-fonts\/([^)]+)\)/g)].map((match) => match[1]);
const rootIndex = html.search(/<div\b[^>]*\bid=["']root["'][^>]*>/i);
const firstScriptIndex = html.indexOf('<script>');
const checks = [
  {
    label: 'offline index contains the React mount point',
    pass: html.includes('<div id="root">') && html.includes('id="root"'),
  },
  {
    label: 'offline index contains an inline classic app script',
    pass: /<script>\s*[\s\S]+<\/script>/.test(html) && !html.includes('type="module"') && !/<script\b[^>]*\bsrc=/i.test(html),
  },
  {
    label: 'offline index embeds the Transformers.js ES module for file:// loading',
    pass: html.includes('id="offline-transformers-module-source"') && html.includes('export{'),
  },
  {
    label: 'offline app script was inlined without replacement-token corruption',
    pass: !/<script>\s*[\s\S]*<\/body>[\s\S]*<\/script>/i.test(html) && !/<script>\s*[\s\S]*<\/head>[\s\S]*<\/script>/i.test(html),
  },
  {
    label: 'offline app script runs after the React mount point exists',
    pass: rootIndex !== -1 && firstScriptIndex > rootIndex,
  },
  {
    label: 'offline index does not point at source files',
    pass: !html.includes('/src/main.tsx') && !html.includes('src="/src/'),
  },
  {
    label: 'offline index does not depend on Google-hosted fonts',
    pass: !html.includes('fonts.googleapis.com') && !html.includes('fonts.gstatic.com') && html.includes('data:font/'),
  },
  {
    label: 'all referenced Google font files are included',
    pass: referencedFonts.length > 0 && referencedFonts.every((fontFileName) => fs.existsSync(path.join(repoRoot, 'dist-offline', 'vendor', 'google-fonts', fontFileName))),
  },
  {
    label: 'offline Material Symbols CSS enables icon ligatures',
    pass: html.includes("font-feature-settings: 'liga'") && html.includes("font-family: 'Material Symbols Outlined'"),
  },
  {
    label: 'offline Google fonts are embedded as data URLs',
    pass: html.includes('data:font/') && !html.includes('url(vendor/google-fonts/'),
  },
  {
    label: 'offline index does not contain external stylesheet tags',
    pass: !/<link\b[^>]*\brel=["']stylesheet["']/i.test(html),
  },
  {
    label: 'offline index does not depend on CDN-hosted Transformers.js',
    pass: !html.includes('cdn.jsdelivr.net/npm/@huggingface/transformers'),
  },
  {
    label: 'offline index points Gemma at bundled model files',
    pass: html.includes('vendor/models/') && html.includes('dtype:"fp16"'),
  },
  {
    label: 'offline zip contains the bundled fp16 Gemma shard',
    pass: fs.statSync(path.join(repoRoot, 'dist-offline', 'vendor', 'models', 'onnx-community', 'gemma-3-270m-it-ONNX', 'onnx', 'model_fp16.onnx_data')).size > 500 * 1024 * 1024,
  },
  {
    label: 'offline zip contains data',
    pass: fs.statSync(zipFile).size > 500 * 1024 * 1024,
  },
];

for (const check of checks) {
  if (!check.pass) fail(`Offline package verification failed: ${check.label}`);
}

if (!process.exitCode) {
  console.log('Offline package verification passed.');
}
