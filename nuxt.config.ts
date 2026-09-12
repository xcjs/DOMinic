export default defineNuxtConfig({
  compatibilityDate: "2026-09-01",
  devtools: { enabled: false },
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "@vueuse/nuxt"],
  srcDir: "app/",
  dir: {
    pages: "pages",
  },
  imports: {
    dirs: ["features/shared"],
  },
  // Every component lives under app/features/**, which the module's default
  // content globs (components/, pages/, layouts/, app.vue, ...) never scan.
  // Globs resolve from the project root; the srcDir-relative form is kept as a fallback.
  tailwindcss: {
    config: {
      content: ["app/**/*.{vue,ts}", "features/**/*.{vue,ts}"],
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  app: {
    head: {
      title: "DOMinic",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      // Play CDN so utility classes that only exist in agent-generated SFCs
      // (never seen at build time) still resolve at runtime.
      script: [{ src: "https://cdn.tailwindcss.com" }],
    },
  },
});