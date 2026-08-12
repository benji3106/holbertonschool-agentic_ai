import js from "@eslint/js";
import globals from "globals";
import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["dist/**"] },
  {
    files: ["**/*.{js,mjs,cjs,svelte}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  ...svelte.configs["flat/recommended"],
]);