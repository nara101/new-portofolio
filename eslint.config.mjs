// eslint-config-next 16 ships native flat config; the FlatCompat wrapper that
// older setups need throws on it.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

export default [
  {
    // The pre-redesign static site. Kept for reference, never linted or built.
    ignores: ["legacy/**", ".next/**", "node_modules/**", "scripts/**"],
  },
  ...(Array.isArray(coreWebVitals) ? coreWebVitals : [coreWebVitals]),
  ...(Array.isArray(typescript) ? typescript : [typescript]),
];
