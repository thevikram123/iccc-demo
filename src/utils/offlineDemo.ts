export const IS_OFFLINE_DEMO = import.meta.env.VITE_OFFLINE_DEMO === 'true';

const offlineTileSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#f7f8f2"/>
  <path d="M0 64h256M0 128h256M0 192h256M64 0v256M128 0v256M192 0v256" stroke="#d7dacb" stroke-width="1"/>
  <path d="M-30 210C35 165 65 175 112 132C158 90 189 72 286 88" fill="none" stroke="#b7c7b0" stroke-width="10" opacity=".55"/>
  <path d="M-20 86C52 98 84 82 134 45C181 10 221 4 285 18" fill="none" stroke="#ccd3bc" stroke-width="7" opacity=".7"/>
  <path d="M18 238L238 18M-26 122L122 -26M134 282L282 134" stroke="#e4d68a" stroke-width="5" opacity=".55"/>
  <circle cx="128" cy="128" r="2" fill="#111"/>
</svg>
`.trim());

export const OFFLINE_TILE_URL = `data:image/svg+xml;charset=utf-8,${offlineTileSvg}`;
export const OFFLINE_TILE_ATTRIBUTION = 'Offline demo grid';
