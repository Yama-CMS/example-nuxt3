<template>
    <h1>{{ document?.title }}</h1>
    <ContentRenderer
        class="content"
        :value="document"
    />
    <section class="wrapper posts">
        <h2>List of posts</h2>
        <List :posts=posts />
    </section>
</template>

<script>
import List from './Home/List.vue';

export default {
    components: {
        List
    },
    props: {
        document: Object,
        posts: Array
    }
}
</script>
