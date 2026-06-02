/// <reference types="vite/client" />

declare const __APP_BUILD_DATE__: string;

interface ImportMetaEnv {
  readonly VITE_WORKER_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
