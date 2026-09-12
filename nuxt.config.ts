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
    },
  },
});