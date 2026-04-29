const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist-offline');
const outDir = path.join(repoRoot, 'offline-build');
const outFile = path.join(outDir, 'iccc-demo-offline.zip');
const docsFile = path.join(repoRoot, 'docs', 'offline-demo.md');
const transformersUrl = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js';
const transformersFile = path.join(distDir, 'vendor', 'transformers.min.js');

if (!fs.existsSync(distDir)) {
  throw new Error('dist-offline does not exist. Run npm run build:offline first.');
}

fs.mkdirSync(outDir, { recursive: true });

function download(url, destination) {
  const protocol = url.startsWith('https:') ? require('https') : require('http');
  fs.mkdirSync(path.dirname(destination), { recursive: true });

  return new Promise((resolve, reject) => {
    const request = protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(response.headers.location, destination).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(destination);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });

    request.on('error', reject);
  });
}

async function ensureTransformersRuntime() {
  if (fs.existsSync(transformersFile)) return;
  console.log('Downloading Transformers.js runtime for the offline zip...');
  await download(transformersUrl, transformersFile);
}

function readDistAsset(assetPath) {
  const normalized = assetPath.replace(/^\.\//, '').replace(/^\//, '');
  return fs.readFileSync(path.join(distDir, normalized), 'utf8');
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

  .material-symbols-outlined {
    align-items: center;
    border: 1px solid currentColor;
    display: inline-flex;
    font-family: var(--offline-font-mono);
    font-size: 0 !important;
    font-style: normal;
    font-weight: 700;
    height: 1.35em;
    justify-content: center;
    line-height: 1;
    min-width: 1.35em;
    overflow: hidden;
    text-transform: uppercase;
    vertical-align: -0.18em;
  }

  .material-symbols-outlined::before {
    content: "";
    display: block;
    height: 0.58em;
    width: 0.58em;
    background: currentColor;
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  }
</style>`;

function inlineBuiltAssets() {
  const indexFile = path.join(distDir, 'index.html');
  let html = fs.readFileSync(indexFile, 'utf8');

  html = html
    .replace(/\s*<link rel="preconnect" href="https:\/\/fonts\.(?:googleapis|gstatic)\.com"[^>]*>\s*/g, '\n')
    .replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^"]+" rel="stylesheet"\s*\/?>\s*/g, '\n');

  html = html.replace(
    /<link rel="stylesheet" crossorigin href="([^"]+)"\s*\/?>/g,
    (_match, href) => `<style>\n${escapeStyle(readDistAsset(href))}\n</style>`
  );

  html = html.replace(
    /<script type="module" crossorigin src="([^"]+)"><\/script>/g,
    (_match, src) => `<script>\n${escapeScript(readDistAsset(src))}\n</script>`
  );

  html = html.replace('</head>', `${offlineRuntimeStyle}\n  </head>`);

  fs.writeFileSync(indexFile, html);
}

async function main() {
  await ensureTransformersRuntime();
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
