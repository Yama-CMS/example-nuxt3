<template>
  <div>
    <Sidebar :pages="pages" />
    <main>
        <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Sidebar from '~/components/Base/Sidebar.vue'
import Footer from '~/components/Base/Footer.vue'

const { data: pages } = await useAsyncData('pages', () => queryContent('pages').find())
</script>

<style src="@/assets/styles/main.css"/>
