import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/infra/datocms/generated/**",
  ]),
  {
    files: ["src/core/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/infra/*", "@/infra/**"],
              message: "core/ must not import infra/ — inject adapters from app/ or use ports.",
            },
            {
              group: ["@/components/*", "@/components/**", "@/app/*", "@/app/**"],
              message: "core/ must not import UI or app layers.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/app/**"],
              message: "components/ must not import app/ — pass Server Actions and data via props.",
            },
            {
              group: ["@/infra/datocms/client", "@/infra/datocms/get-*", "@/infra/datocms/search"],
              message: "components/ must not fetch — load data in app/ and pass props.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
