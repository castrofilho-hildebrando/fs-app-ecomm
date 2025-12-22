import eslintPluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  {
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.browser,
  },
  plugins: {
      "@typescript-eslint": tseslint.plugin,
  },
  rules: {
      ...eslintPluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
  },
},
];
