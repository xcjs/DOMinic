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
      content: ["app/**/*.{vue,ts,txt}", "features/**/*.{vue,ts,txt}"],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  // Baseline Content Security Policy (issue #81), enforced by Nitro headers
  // so it applies in dev and in the built server. Sources mirror the
  // as-built data flow:
  // - script-src: the app bundle ('self'), Nuxt's inline boot scripts
  //   ('unsafe-inline'; tightening to nonces/hashes rides with the
  //   sandbox work in NEXT.md step 1.4, decision D1), runtime npm deps
  //   compiled from esm.sh by the app runner (ADR 0008), the Tailwind
  //   Play CDN, and 'unsafe-eval' — vue3-sfc-loader (ADR 0006) evaluates
  //   agent-authored SFCs with new Function/eval. The eval concession is
  //   deliberate and scheduled for removal by the same sandbox work.
  // - connect-src: 'self' covers /api/chat; provider traffic is server-side
  //   (ADR 0005), so provider hosts are not reachable from the browser and
  //   are intentionally absent. esm.sh serves dependency fetches. Note the
  //   baseline therefore also constrains agent-authored apps: direct
  //   fetch() to third-party CORS APIs (ADR 0009 direct-first) and remote
  //   images do not pass until the sandbox work rewrites app networking
  //   through the approved channels (esm.sh deps, /api/chat proxying).
  // - style-src: 'unsafe-inline' is required by dynamic app style injection
  //   (sfc-loader addStyle) and Tailwind Play CDN runtime styles.
  routeRules: {
    "/**": {
      headers: {
        "Content-Security-Policy":
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://esm.sh https://cdn.tailwindcss.com; " +
          "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; " +
          "img-src 'self' data:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' https://esm.sh; " +
          "object-src 'none'; " +
          "base-uri 'self'; " +
          "form-action 'self'; " +
          "frame-ancestors 'none'",
      },
    },
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
