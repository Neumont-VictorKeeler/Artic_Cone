import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // Ignore unused variables
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' type
      "react-hooks/rules-of-hooks": "off", // Disable strict React Hook rules
      "prefer-const": "warn", // Make 'prefer-const' a warning instead of an error
      "@next/next/no-img-element": "off", // Allow using <img> instead of <Image />
    },
  },
];

export default eslintConfig;
