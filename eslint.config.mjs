import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import globals from "globals";

const sliceDirs = ["os", "chat", "apps", "settings"];

const sliceBoundaryMessage = [
  "Slices must not import each other (ADR 0001).",
  "Cross-slice state flows through the Pinia stores in app/shared/",
  "and cross-slice types through app/shared/.",
  "The composition root app/app.vue composes slices via imports;",
  "if this warning fired there or in server/, that boundary usage is",
  "intentional - restrict this rule's application instead of editing it.",
].join(" ");

/**
 * Build a no-restricted-imports rule entry prohibiting imports that name
 * a slice other than the one the importing file lives in. Paths are
 * normalized to support alias forms (`~/features/...`, `@/features/...`)
 * and plain relative forms.
 */
function noCrossSliceImports(currentSlice) {
  const patterns = sliceDirs
    .filter((s) => s !== currentSlice)
    .flatMap((s) => [
      { group: [`**/features/${s}/**`], message: sliceBoundaryMessage },
      { group: [`**/features/${s}`], message: sliceBoundaryMessage },
    ]);
  return ["error", { patterns }];
}

export default tseslint.config(
  {
    ignores: [
      ".nuxt/**",
      ".output/**",
      "node_modules/**",
      "dist/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Nuxt auto-imports (ref, composables, stores) are declared in
      // generated .nuxt types; vue-tsc verifies them, so core no-undef
      // (which does not read TS declarations) must stay off in TS scopes.
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      // Hackathon POC: the runtime-engine slice owns the known `any`s in
      // the runtime/ai boundary (issue #82 follow-up tightens this).
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Ambient third-party typings (vue3-sfc-loader d.ts) legitimately
  // mirror an `any`-typed public API.
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Kernel files (app/shared/**) belong to every slice and are the only
  // cross-slice state channel (ADR 0003); they get no boundary rules.
  {
    files: ["app/shared/**/*.{ts,vue}"],
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
  ...sliceDirs.map((slice) => ({
    files: [`app/features/${slice}/**/*.{ts,vue}`],
    rules: {
      "no-restricted-imports": noCrossSliceImports(slice),
      "@typescript-eslint/no-restricted-imports": noCrossSliceImports(slice),
    },
  })),
  // Composition root: composes slices (ADR 0001 sole import exception).
  {
    files: ["app/app.vue"],
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
  {
    files: ["*.mjs", "*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },
);