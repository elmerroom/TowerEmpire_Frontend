/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  // добавляй свои VITE_* по мере необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
