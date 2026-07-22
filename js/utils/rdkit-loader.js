// RDKit.js(MinimalLib) lazy loader.
// utils 레이어 예외: CDN 스크립트 주입을 위해 document에 접근한다 (README 참고).
const RDKIT_VERSION = "2025.3.4-1.0.0";
const RDKIT_SCRIPT_URL = `https://cdn.jsdelivr.net/npm/@rdkit/rdkit@${RDKIT_VERSION}/dist/RDKit_minimal.js`;
// SRI 무결성 해시: CDN 변조 시 스크립트 실행을 차단한다. RDKIT_VERSION을 올리면 함께 갱신할 것.
// 재계산: curl -sL <RDKIT_SCRIPT_URL> | openssl dgst -sha384 -binary | openssl base64 -A
const RDKIT_SCRIPT_INTEGRITY = "sha384-TH78XRTbtgxTRilQF/3YpyA5cjKY3LCy7PffYS7Za7DJe1mTGmb70BWYa6K03bH1";

let rdkitPromise = null;

const injectScript = (url) =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    // 무결성 검증에는 CORS 응답이 필요하다(jsDelivr는 CORS를 지원).
    script.crossOrigin = "anonymous";
    script.integrity = RDKIT_SCRIPT_INTEGRITY;
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
