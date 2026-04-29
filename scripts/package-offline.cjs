const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist-offline');
const outDir = path.join(repoRoot, 'offline-build');
const outFile = path.join(outDir, 'iccc-demo-offline.zip');
const docsFile = path.join(repoRoot, 'docs', 'offline-demo.md');
const transformersDistUrl = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist';
const transformersRuntimeFiles = [
  'transformers.min.js',
  'ort.bundle.min.mjs',
  'ort-wasm-simd-threaded.jsep.mjs',
  'ort-wasm-simd-threaded.jsep.wasm',
];
const googleFontCssUrls = [
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&family=Inter:wght@100;300;400;500;600;700;800&family=JetBrains+Mono:wght@100;300;400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
];
const googleFontsDir = path.join(distDir, 'vendor', 'google-fonts');
const googleFontsCssFile = path.join(googleFontsDir, 'fonts.css');

if (!fs.existsSync(distDir)) {
  throw new Error('dist-offline does not exist. Run npm run build:offline first.');
}

fs.mkdirSync(outDir, { recursive: true });

function fetchBuffer(url) {
  const protocol = url.startsWith('https:') ? require('https') : require('http');

  return new Promise((resolve, reject) => {
    const request = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        fetchBuffer(new URL(response.headers.location, url).toString()).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Failed to fetch ${url}: HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });

    request.on('error', reject);
  });
}

async function download(url, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, await fetchBuffer(url));
}

async function ensureTransformersRuntime() {
  const missingRuntimeFiles = transformersRuntimeFiles.filter((fileName) => !fs.existsSync(path.join(distDir, 'vendor', fileName)));
  if (missingRuntimeFiles.length === 0) return;

  console.log('Downloading Transformers.js runtime for the offline zip...');
  for (const fileName of missingRuntimeFiles) {
    await download(`${transformersDistUrl}/${fileName}`, path.join(distDir, 'vendor', fileName));
  }
}

async function ensureGoogleFonts() {
  if (googleFontsAreComplete()) return;

  console.log('Downloading Google font and Material Symbols assets for the offline zip...');
  fs.mkdirSync(googleFontsDir, { recursive: true });

  let combinedCss = '';
  let fontIndex = 0;

  for (const cssUrl of googleFontCssUrls) {
    let css = (await fetchBuffer(cssUrl)).toString('utf8');
    const fontUrls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)].map((match) => match[1]);

    for (const fontUrl of fontUrls) {
      const parsed = new URL(fontUrl);
      const ext = path.extname(parsed.pathname) || '.woff2';
      const fontFileName = `google-font-${fontIndex}${ext}`;
      const fontFile = path.join(googleFontsDir, fontFileName);
      await download(fontUrl, fontFile);
      css = css.replaceAll(fontUrl, `vendor/google-fonts/${fontFileName}`);
      fontIndex += 1;
    }

    combinedCss += `${css}\n`;
  }

  fs.writeFileSync(googleFontsCssFile, combinedCss);
}

function googleFontsAreComplete() {
  if (!fs.existsSync(googleFontsCssFile)) return false;
  const css = fs.readFileSync(googleFontsCssFile, 'utf8');
  const referencedFonts = [...css.matchAll(/url\(vendor\/google-fonts\/([^)]+)\)/g)].map((match) => match[1]);
  return referencedFonts.length > 0 && referencedFonts.every((fontFileName) => fs.existsSync(path.join(googleFontsDir, fontFileName)));
}

function getHtmlAttribute(tag, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = tag.match(pattern);
  return match ? match[1] || match[2] || match[3] || '' : '';
}

function isGoogleHostedFontUrl(href) {
  try {
    const url = new URL(href.startsWith('//') ? `https:${href}` : href);
    const hostname = url.hostname.toLowerCase();
    return ['http:', 'https:'].includes(url.protocol) && ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(hostname);
  } catch {
    return false;
  }
}

function isRemoteAssetUrl(assetPath) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(assetPath);
}

function readDistAsset(assetPath) {
  if (isRemoteAssetUrl(assetPath)) {
    throw new Error(`Cannot inline remote asset URL from dist-offline/index.html: ${assetPath}`);
  }

  const normalized = assetPath.replace(/^\.\//, '').replace(/^\//, '');
  const assetFile = path.resolve(distDir, normalized);
  if (!assetFile.startsWith(`${distDir}${path.sep}`)) {
    throw new Error(`Cannot inline asset outside dist-offline: ${assetPath}`);
  }

  return fs.readFileSync(assetFile, 'utf8');
}

function escapeStyle(css) {
  return css.replace(/<\/style/gi, '<\\/style');
}

function escapeScript(js) {
  return js.replace(/<\/script/gi, '<\\/script');
}

const offlineRuntimeStyle = `
<style id="offline-runtime-fallbacks">
  :root {
    --offline-font-body: Inter, Segoe UI, Arial, sans-serif;
    --offline-font-headline: Space Grotesk, Segoe UI, Arial, sans-serif;
    --offline-font-mono: JetBrains Mono, Consolas, monospace;
  }
</style>`;

// Shown before React mounts; React replaces #root content on first render so this disappears.
// If JS crashes before mounting, this message remains visible instead of a blank page.
const offlineLoadingShell = `<div id="offline-loading-shell" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#fff;font-family:monospace;font-size:13px;color:#555;z-index:9999;pointer-events:none">
  <div style="text-align:center">
    <div style="font-size:24px;margin-bottom:8px">⚙</div>
    <div>Loading ICCC demo…</div>
    <div id="offline-error-msg" style="display:none;color:#c00;margin-top:12px;max-width:480px"></div>
  </div>
</div>
<script>
window.addEventListener('error', function(e) {
  var el = document.getElementById('offline-error-msg');
  if (el) { el.style.display = 'block'; el.textContent = 'JS error: ' + e.message + ' (' + (e.filename||'') + ':' + e.lineno + ')'; }
});
<\/script>`;

function inlineBuiltAssets() {
  const indexFile = path.join(distDir, 'index.html');
  let html = fs.readFileSync(indexFile, 'utf8');
  const inlineScripts = [];

  // Remove Google Fonts network requests (preconnect + stylesheet links).
  html = html.replace(/\s*<link\b[^>]*>\s*/gi, (tag) => {
    const href = getHtmlAttribute(tag, 'href');
    return isGoogleHostedFontUrl(href) ? '\n' : tag;
  });

  html = html.replace('</head>', `<style id="offline-google-fonts">\n${escapeStyle(fs.readFileSync(googleFontsCssFile, 'utf8'))}\n</style>\n  </head>`);

  html = html.replace(
    /<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*\/?>/gi,
    (_match, href) => `<style>\n${escapeStyle(readDistAsset(href))}\n</style>`
  );

  // Matches both <script type="module" src="..."> (ESM) and plain <script src="..."> (IIFE).
  // Vite injects type="module" for ESM builds and a classic <script> for IIFE builds.
  html = html.replace(
    /<script\b(?=[^>]*\bsrc=["']([^"']+)["'])[^>]*>\s*<\/script>/gi,
    (_match, src) => {
      inlineScripts.push(`<script>\n${escapeScript(readDistAsset(src))}\n</script>`);
      return '';
    }
  );

  if (inlineScripts.length !== 1) {
    throw new Error(`Expected exactly one built app script to inline, found ${inlineScripts.length}.`);
  }

  if (/<script\b[^>]*\btype=["']module["']/i.test(html) || /<script\b[^>]*\bsrc=/i.test(html) || /<link\b[^>]*\brel=["']stylesheet["']/i.test(html)) {
    throw new Error('Offline index still contains external script or stylesheet tags after inlining.');
  }

  html = html.replace('</head>', `${offlineRuntimeStyle}\n  </head>`);
  // Loading shell goes first so it shows while the app script executes.
  // React's createRoot replaces #root content, which removes the shell on successful mount.
  html = html.replace('<div id="root"></div>', `<div id="root">${offlineLoadingShell}</div>`);
  html = html.replace('</body>', `${inlineScripts.join('\n')}\n  </body>`);

  fs.writeFileSync(indexFile, html);
}

async function main() {
  await ensureTransformersRuntime();
  await ensureGoogleFonts();
  inlineBuiltAssets();
  writeZip();
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[i] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function collectFiles(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    const zipPath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) return collectFiles(fullPath, zipPath);
    return [{ fullPath, zipPath }];
  });
}

function writeZip() {
  const files = collectFiles(distDir);
  files.push({ fullPath: docsFile, zipPath: 'OFFLINE_DEMO_README.md' });

  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const data = fs.readFileSync(file.fullPath);
    const name = Buffer.from(file.zipPath.replace(/\\/g, '/'));
    const { dosDate, dosTime } = dosDateTime(fs.statSync(file.fullPath).mtime);
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);

    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);

    offset += local.length + name.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  fs.writeFileSync(outFile, Buffer.concat([...localParts, ...centralParts, end]));
  console.log(`Created ${path.relative(repoRoot, outFile)} (${files.length} files)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
