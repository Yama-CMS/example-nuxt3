<template>
    <nav>
        <ul>
            <li v-for="page in pages">
                <img
                    class="thumb"
                    :src="page?.media?.formats?.thumb?.url ?? 'https://placehold.co/40x40'"
                    :alt="page?.media?.alt"
                />
                <NuxtLink :to="page.permalink">
                    {{ page.title }}
                </NuxtLink>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
  props: {
    pages: Array
  }
}
</script>
