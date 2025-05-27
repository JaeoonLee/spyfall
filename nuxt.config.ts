import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/fonts'],
  runtimeConfig: {
    ACCESS_PASSWORD: process.env.ACCESS_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  eslint: {
    config: {
      stylistic: true
    }
  }
})