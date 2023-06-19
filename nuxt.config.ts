export default defineNuxtConfig({
    modules: [
        '@nuxt/content',
        '~/src/modules/content.js'
    ],
    ssr: true,
    content: {
        documentDriven: false,
    },
    nitro: {
        prerender: {
            crawlLinks: true,
        }
    },
})
