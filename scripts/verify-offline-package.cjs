const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const indexFile = path.join(repoRoot, 'dist-offline', 'index.html');
const transformersRuntimeFiles = [
  'transformers.min.js',
  'ort.bundle.min.mjs',
  'ort-wasm-simd-threaded.jsep.mjs',
  'ort-wasm-simd-threaded.jsep.wasm',
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
  ...transformersRuntimeFiles.map((fileName) => path.join(repoRoot, 'dist-offline', 'vendor', fileName)),
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
    label: 'offline app script runs after the React mount point exists',
    pass: rootIndex !== -1 && firstScriptIndex > rootIndex,
  },
  {
    label: 'offline index does not point at source files',
    pass: !html.includes('/src/main.tsx') && !html.includes('src="/src/'),
  },
  {
    label: 'offline index does not depend on Google-hosted fonts',
    pass: !html.includes('fonts.googleapis.com') && !html.includes('fonts.gstatic.com') && html.includes('vendor/google-fonts/'),
  },
  {
    label: 'all referenced Google font files are included',
    pass: referencedFonts.length > 0 && referencedFonts.every((fontFileName) => fs.existsSync(path.join(repoRoot, 'dist-offline', 'vendor', 'google-fonts', fontFileName))),
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
    label: 'offline zip contains data',
    pass: fs.statSync(zipFile).size > 1024 * 1024,
  },
];

for (const check of checks) {
  if (!check.pass) fail(`Offline package verification failed: ${check.label}`);
}

if (!process.exitCode) {
  console.log('Offline package verification passed.');
}
