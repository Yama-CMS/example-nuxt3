<template>
    <h1>{{ document.title }}</h1>
    <p v-if="document.summary">
        {{ document.summary }}
    </p>
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
