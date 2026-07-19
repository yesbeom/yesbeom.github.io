// RDKit.js(MinimalLib) lazy loader.
// utils 레이어 예외: CDN 스크립트 주입을 위해 document에 접근한다 (README 참고).
const RDKIT_VERSION = "2025.3.4-1.0.0";
const RDKIT_SCRIPT_URL = `https://cdn.jsdelivr.net/npm/@rdkit/rdkit@${RDKIT_VERSION}/dist/RDKit_minimal.js`;

let rdkitPromise = null;

const injectScript = (url) =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      script.remove();
      reject(new Error("rdkit-script-load-failed"));
    });
    document.head.appendChild(script);
  });

export const loadRDKit = () => {
  if (!rdkitPromise) {
    rdkitPromise = (async () => {
      if (typeof window.initRDKitModule !== "function") {
        await injectScript(RDKIT_SCRIPT_URL);
      }
      if (typeof window.initRDKitModule !== "function") {
        throw new Error("rdkit-init-missing");
      }
      return window.initRDKitModule();
    })().catch((error) => {
      rdkitPromise = null;
      throw error;
    });
  }
  return rdkitPromise;
};
