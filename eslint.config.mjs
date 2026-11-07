import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    // Regra nova do React 19.2: avisa sobre setState em efeitos. Os casos do projeto são
    // leituras do navegador (carrinho, relógio, preferências) feitas depois da hidratação.
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
