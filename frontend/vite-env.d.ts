/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // További környezeti változók hozzáadhatók ide
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
