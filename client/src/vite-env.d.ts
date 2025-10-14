/// <reference types="vite/client" />

// Global constants injected by Vite
declare const __XR_ENV__: string;

// Override WebSpatial SDK type definition for enable-xr
// WebSpatial SDK incorrectly types it as boolean, but React requires string at runtime
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
      > & { "enable-xr"?: string };
      button: React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      > & { "enable-xr"?: string };
      span: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLSpanElement>,
        HTMLSpanElement
      > & { "enable-xr"?: string };
      [elemName: string]: any;
    }
  }
}
