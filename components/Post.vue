<template>
    <h1>{{ document.title }}</h1>
    <img
        class="media-desktop"
        :src="document.media?.formats?.desktop?.url ?? 'https://placehold.co/800?text=No+media+found&font=roboto'"
        :alt="document.media?.alt"
    />
    <ContentRenderer
        class="content"
        :value="document"
    />
</template>

<script setup>
defineProps({
    document: {
        type: Object,
        required: true
    }
})
</script>
