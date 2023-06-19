<template>
    <Home
        :document="document"
        :posts="posts"
    />
</template>

<script setup>
import Home from '~/components/Home.vue'

const { data: document } = await useAsyncData('document', () => queryContent().where({ permalink: '/' }).findOne())
const { data: posts } = await useAsyncData('posts', () => queryContent('posts').find())
</script>
