// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-03-15',
  devtools: { enabled: true },
  // alias: {
  //   'string_decoder': 'string_decoder/',
  // },
  // nitro: {
  //   prerender: {
  //     autoSubfolderIndex: false
  //   }
  // },
  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxthub/core'
  ],
  debug: {
    // Enable specific debugging features
    templates: false,
    modules: false,
    watchers: false,
    hooks: {
      client: false,
      server: false,
    },
    nitro: true,
    router: false,
    hydration: false,
  },
  runtimeConfig: {
    // Server-side environment variables
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      productId: process.env.STRIPE_PRODUCT_ID,
    },
    vimeo: {
      accessToken: process.env.VIMEO_ACCESS_TOKEN,
      clientId: process.env.VIMEO_CLIENT_ID,
      userId: process.env.VIMEO_USER_ID,
      clientSecret: process.env.VIMEO_CLIENT_SECRET,
    },
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
      },
      stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        basicPriceId: process.env.STRIPE_BASIC_PRICE_ID,
        premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        educationPriceId: process.env.STRIPE_EDUCATION_PRICE_ID,
      },
    },
  },
})