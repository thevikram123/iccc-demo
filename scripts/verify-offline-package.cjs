const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const indexFile = path.join(repoRoot, 'dist-offline', 'index.html');
const transformersFile = path.join(repoRoot, 'dist-offline', 'vendor', 'transformers.min.js');
const googleFontsCssFile = path.join(repoRoot, 'dist-offline', 'vendor', 'google-fonts', 'fonts.css');
const zipFile = path.join(repoRoot, 'offline-build', 'iccc-demo-offline.zip');

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

for (const file of [indexFile, transformersFile, googleFontsCssFile, zipFile]) {
  if (!fs.existsSync(file)) {
    fail(`Missing expected offline artifact: ${path.relative(repoRoot, file)}`);
  }
}

if (process.exitCode) process.exit();

const html = fs.readFileSync(indexFile, 'utf8');
const checks = [
  {
    label: 'offline index contains the React mount point',
    pass: html.includes('<div id="root"></div>'),
  },
  {
    label: 'offline index contains an inline classic app script',
    pass: /<script>\s*[\s\S]+<\/script>/.test(html) && !html.includes('type="module"'),
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
