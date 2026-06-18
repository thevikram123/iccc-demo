/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OFFLINE_DEMO?: string;
  readonly VITE_WORKER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
