<template>
    <component
        :is="layout[document?.layout]"
        :document="document"
    />
</template>

<script setup>
import Page from '~/components/Page.vue'
import Post from '~/components/Post.vue'

const layout = { page: Page, post: Post }
const { data: document } = await useAsyncData('document', () => queryContent().where({ permalink: useRoute().path }).findOne())
</script>
