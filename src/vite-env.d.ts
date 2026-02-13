/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_AI_BUILDER: string;
  readonly VITE_ENABLE_LEGACY_FORMATS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
