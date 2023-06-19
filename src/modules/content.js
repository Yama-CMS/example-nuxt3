import { defineNuxtModule } from '@nuxt/kit'
import { getAllPermalinks } from '../../lib/filesystem'

export default defineNuxtModule({
  hooks: {
    "nitro:config": async (nitroConfig) => {
        nitroConfig.prerender.routes = await getAllPermalinks()
    },
  },
})