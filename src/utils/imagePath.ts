// Resolves image paths correctly whether running on localhost or GitHub Pages
// On GitHub Pages the app lives at /iccc-demo/ so /images/x.jpg becomes /iccc-demo/images/x.jpg
const base = (process.env.BASE_URL || '').replace(/\/$/, '');

export function img(path: string): string {
  // path should start with /images/...
  return base + path;
}
