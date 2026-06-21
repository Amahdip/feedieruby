/// <reference types="vite/client" />

declare global {
  interface Window {
    __salamrubyNonce?: string;
    salamrubySurveys?: {
      renderSurvey: (options: unknown) => void;
      setNonce: (nonce: string | undefined) => void;
    };
  }
}

export {};
